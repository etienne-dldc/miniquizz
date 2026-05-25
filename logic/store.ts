import { createSubscription, type SubscribeMethod } from "@dldc/pubsub";
import { throttle } from "@std/async/unstable-throttle";
import { resolve } from "@std/path";
import type { AdminAction } from "./adminActionSchema.ts";
import { type Block, type Doc, parseDoc, type Step } from "./parseDoc.ts";
import type { Session } from "./sessions.ts";
import type { UserAction } from "./userActionSchema.ts";
import { restore, sanitize } from "./zenjson.ts";

export type AppAction = {
  session: Session;
  action: AdminAction | UserAction | { type: "Join" };
};

export type AppEvent = {
  audience: { type: "All" } | { type: "User"; sessionId: string } | { type: "Admin" };
  topic: "Quizz" | "Status";
};

export type AppSessionState = {
  isAdmin?: boolean;
  votes: Map<number, string>;
};

export type Options = { value: string; isCorrect: boolean }[];

export type AppProgress =
  | {
    type: "question";
    stepIndex: number;
    appearOffset: number;
    questionIndex: number;
    phase: "question" | "answer";
    options: Options;
    step: Step;
  }
  | { type: "slide"; stepIndex: number; appearOffset: number; step: Step };

export interface AppState {
  state: "running" | "idle";
  doc: Doc;
  progress: number;
  sessions: Map<string, AppSessionState>;
}

export interface CurrentSessionState {
  isAdmin?: boolean;
  voteValue: string | null;
}

export interface SessionResults {
  correct: number;
  wrong: number;
  skipped: number;
}

export interface CurrentQuestionStats {
  totalUsers: number;
  totalVotes: number;
}

export interface AppStore {
  subscribe: SubscribeMethod<AppEvent>;
  dispatch: (action: AppAction) => void;
  getState: () => AppState;
  getDoc: () => Doc;
  getCurrentProgress: () => AppProgress;
  getCurrentSessionState: (sessionId: string) => CurrentSessionState | null;
  getCurrentQuestionStats: () => CurrentQuestionStats;
  getSessionResults: (sessionId: string) => SessionResults | null;
  getOptionVoteCount: (questionIndex: number, optionValue: string) => number;
  dispose: () => Promise<void>;
}

export async function createAppStore(
  storage: Storage,
  dataPath: string,
  storageKey: string,
): Promise<AppStore> {
  await ensureDataFolder(dataPath);
  const docFilePath = resolve(dataPath, "data.doc.tsx");
  const sub = createSubscription<AppEvent>();
  let state: AppState = loadState(storage, storageKey, await parseDoc(docFilePath));
  let allProgress = computeAllProgress(state.doc);
  state = reconcileStateWithDoc(state, allProgress);

  const saveStateThrottled = throttle(saveState, 200);
  const watcher = Deno.watchFs(dataPath);
  let disposed = false;
  let isReloadingDoc = false;
  let docReloadQueued = false;
  let docReloadDebounceHandle: number | null = null;
  const watchTask = watchDocChanges();

  return {
    subscribe: sub.subscribe,
    dispatch,
    getState: () => state,
    getDoc: () => state.doc,
    getCurrentProgress,
    getCurrentSessionState,
    getCurrentQuestionStats,
    getSessionResults,
    getOptionVoteCount,
    dispose,
  };

  async function dispose() {
    if (disposed) {
      return;
    }
    disposed = true;
    if (docReloadDebounceHandle !== null) {
      clearTimeout(docReloadDebounceHandle);
      docReloadDebounceHandle = null;
    }
    watcher.close();
    try {
      await watchTask;
    } catch (err) {
      console.error("Failed while disposing doc watcher", err);
    }
  }

  async function watchDocChanges() {
    try {
      for await (const event of watcher) {
        if (disposed) {
          return;
        }
        if (!isDocFileEvent(event)) {
          continue;
        }
        scheduleDocReload();
      }
    } catch (err) {
      if (!disposed) {
        console.error("Doc watcher crashed", err);
      }
    }
  }

  function isDocFileEvent(event: Deno.FsEvent): boolean {
    return event.paths.some((path) => resolve(path) === docFilePath);
  }

  function scheduleDocReload() {
    if (docReloadDebounceHandle !== null) {
      clearTimeout(docReloadDebounceHandle);
    }
    docReloadDebounceHandle = setTimeout(() => {
      docReloadDebounceHandle = null;
      void reloadDoc();
    }, 100);
  }

  async function reloadDoc() {
    if (disposed) {
      return;
    }
    if (isReloadingDoc) {
      docReloadQueued = true;
      return;
    }
    isReloadingDoc = true;
    try {
      const nextDoc = await parseDoc(docFilePath);
      allProgress = computeAllProgress(nextDoc);
      state = reconcileStateWithDoc({ ...state, doc: nextDoc }, allProgress);
      saveStateThrottled();
      emitAllTopicsRefresh();
    } catch (err) {
      console.error("Failed to reload doc after filesystem change", err);
    } finally {
      isReloadingDoc = false;
      if (docReloadQueued) {
        docReloadQueued = false;
        void reloadDoc();
      }
    }
  }

  function emitAllTopicsRefresh() {
    sub.emit({ audience: { type: "All" }, topic: "Quizz" });
    sub.emit({ audience: { type: "All" }, topic: "Status" });
  }

  function dispatch({ action, session }: AppAction) {
    if (action.type === "Reset") {
      state = createInitialAppState(state.doc);
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "All" }, topic: "Status" });
      saveStateThrottled();
      return;
    }

    if (action.type === "Start") {
      if (state.state !== "idle") {
        return;
      }
      state.state = "running";
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "Admin" }, topic: "Status" });
      saveStateThrottled();
      return;
    }

    if (action.type === "Next") {
      if (state.state !== "running") {
        return;
      }
      if (state.progress >= allProgress.length - 1) {
        return;
      }
      state.progress += 1;
      saveStateThrottled();
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "Admin" }, topic: "Status" });
      return;
    }

    if (action.type === "Prev") {
      if (state.state !== "running") {
        return;
      }
      if (state.progress <= 0) {
        return;
      }
      state.progress -= 1;
      saveStateThrottled();
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "Admin" }, topic: "Status" });
      return;
    }

    if (action.type === "Join") {
      let sessionState = state.sessions.get(session.id);
      if (!sessionState) {
        sessionState = { votes: new Map(), isAdmin: session.isAdmin };
        state.sessions.set(session.id, sessionState);
        saveStateThrottled();
        sub.emit({ audience: { type: "Admin" }, topic: "Status" });
      }
      return;
    }

    if (action.type === "Vote") {
      const progress = getCurrentProgress();
      if (progress.type !== "question") {
        return;
      }
      if (progress.phase !== "question") {
        return;
      }
      if (!progress.options.some((option) => option.value === action.optionValue)) {
        return;
      }
      let sessionState = state.sessions.get(session.id);
      if (!sessionState) {
        sessionState = { votes: new Map(), isAdmin: session.isAdmin };
        state.sessions.set(session.id, sessionState);
      }
      sessionState.votes.set(progress.questionIndex, action.optionValue);
      saveStateThrottled();
      sub.emit({ audience: { type: "User", sessionId: session.id }, topic: "Quizz" });
      sub.emit({ audience: { type: "Admin" }, topic: "Status" });
      return;
    }

    if (action.type === "ResetStep") {
      const progress = getCurrentProgress();
      if (progress.type !== "question") {
        return;
      }
      const questionIndex = progress.questionIndex;
      for (const sessionState of state.sessions.values()) {
        sessionState.votes.delete(questionIndex);
      }
      saveStateThrottled();
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "Admin" }, topic: "Status" });
      return;
    }

    action satisfies never;
  }

  function getCurrentProgress(): AppProgress {
    const progressClamped = Math.max(0, Math.min(state.progress, allProgress.length - 1));
    const progress = allProgress[progressClamped];
    return progress;
  }

  function getCurrentSessionState(sessionId: string): CurrentSessionState | null {
    const sessionState = state.sessions.get(sessionId);
    const progress = getCurrentProgress();
    if (progress.type !== "question") {
      return { isAdmin: true, voteValue: null };
    }
    if (!sessionState) {
      return null;
    }
    return {
      isAdmin: sessionState.isAdmin,
      voteValue: sessionState.votes.get(progress.questionIndex) ?? null,
    };
  }

  function getCurrentQuestionStats(): CurrentQuestionStats {
    const totalUsers = Array.from(state.sessions.values()).filter((sessionState) => !sessionState.isAdmin).length;
    const progress = getCurrentProgress();
    if (progress.type !== "question") {
      return { totalUsers, totalVotes: 0 };
    }
    const totalVotes = Array.from(state.sessions.values()).reduce((acc, sessionState) => {
      if (sessionState.isAdmin) {
        return acc;
      }
      const vote = sessionState.votes.get(progress.questionIndex);
      if (vote !== undefined) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return { totalUsers, totalVotes };
  }

  function getSessionResults(sessionId: string): SessionResults | null {
    const sessionState = state.sessions.get(sessionId);
    if (!sessionState) {
      return null;
    }
    const seensQuestion = new Set<number>();
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    for (let i = 0; i < state.progress; i++) {
      const progressItem = allProgress[i];
      if (progressItem.type !== "question") {
        continue;
      }
      if (seensQuestion.has(progressItem.questionIndex)) {
        continue;
      }
      seensQuestion.add(progressItem.questionIndex);
      const vote = sessionState.votes.get(progressItem.questionIndex);
      if (vote === undefined) {
        skipped++;
        continue;
      }
      const option = progressItem.options.find((option) => option.value === vote);
      if (!option) {
        skipped++;
        continue;
      }
      if (option.isCorrect) {
        correct++;
      } else {
        wrong++;
      }
    }
    return { correct, wrong, skipped };
  }

  function getOptionVoteCount(questionIndex: number, optionValue: string): number {
    let count = 0;
    for (const sessionState of state.sessions.values()) {
      if (sessionState.isAdmin) {
        continue;
      }
      const vote = sessionState.votes.get(questionIndex);
      if (vote === optionValue) {
        count++;
      }
    }
    return count;
  }

  function saveState() {
    try {
      const copy = { ...state, doc: undefined };
      storage.setItem(storageKey, JSON.stringify(sanitize(copy)));
    } catch (err) {
      console.error("Failed to save app state to storage", err);
    }
  }
}

function createInitialAppState(doc: Doc): AppState {
  return {
    state: "idle",
    doc: doc,
    progress: 0,
    sessions: new Map(),
  };
}

function reconcileStateWithDoc(state: AppState, allProgress: AppProgress[]): AppState {
  const nextState: AppState = {
    ...state,
    sessions: new Map(),
    progress: clampProgress(state.progress, allProgress.length),
  };
  const optionsByQuestionIndex = buildOptionsByQuestionIndex(allProgress);

  for (const [sessionId, sessionState] of state.sessions.entries()) {
    const filteredVotes = new Map<number, string>();
    for (const [questionIndex, vote] of sessionState.votes.entries()) {
      const validOptions = optionsByQuestionIndex.get(questionIndex);
      if (!validOptions || !validOptions.has(vote)) {
        continue;
      }
      filteredVotes.set(questionIndex, vote);
    }
    nextState.sessions.set(sessionId, { ...sessionState, votes: filteredVotes });
  }

  return nextState;
}

function clampProgress(progress: number, allProgressLength: number): number {
  if (allProgressLength <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(progress, allProgressLength - 1));
}

function buildOptionsByQuestionIndex(allProgress: AppProgress[]): Map<number, Set<string>> {
  const optionsByQuestionIndex = new Map<number, Set<string>>();
  for (const progress of allProgress) {
    if (progress.type !== "question" || progress.phase !== "question") {
      continue;
    }
    optionsByQuestionIndex.set(
      progress.questionIndex,
      new Set(progress.options.map((option) => option.value)),
    );
  }
  return optionsByQuestionIndex;
}

function loadState(storage: Storage, storageKey: string, doc: Doc): AppState {
  const data = storage.getItem(storageKey);
  if (!data) {
    return createInitialAppState(doc);
  }
  try {
    const restored = restore(JSON.parse(data)) as AppState;
    return { ...restored, doc: doc };
  } catch (err) {
    console.error("Failed to parse app state from storage", err);
    return createInitialAppState(doc);
  }
}

async function ensureDataFolder(dataPath: string) {
  try {
    const stat = await Deno.stat(dataPath);
    if (!stat.isDirectory) {
      throw new Error(
        `Data folder path ${dataPath} exists but is not a directory`,
      );
    }
  } catch (err) {
    throw new Error(
      `Data folder path ${dataPath} does not exist or is not accessible`,
      { cause: err },
    );
  }
}

function computeAllProgress(doc: Doc): AppProgress[] {
  const steps: AppProgress[] = [];
  let questionIndex = 0;
  doc.steps.forEach((step, index) => {
    const options = extractOptions(step);
    const base: AppProgress = options.length === 0
      ? { stepIndex: index, appearOffset: 0, type: "slide", step }
      : { stepIndex: index, appearOffset: 0, type: "question", questionIndex, options, phase: "question", step };
    steps.push(base);
    for (let appearOffset = 1; appearOffset <= step.maxAppearOffset; appearOffset++) {
      steps.push({ ...base, appearOffset });
    }
    if (options.length > 0) {
      steps.push({ stepIndex: index, type: "question", appearOffset: step.maxAppearOffset, questionIndex, options, phase: "answer", step });
      questionIndex++;
    }
  });
  return steps;
}

function extractOptions(step: Step): { value: string; isCorrect: boolean }[] {
  function extractFromBlocks(blocks: Block[]): { value: string; isCorrect: boolean }[] {
    let options: { value: string; isCorrect: boolean }[] = [];
    for (const block of blocks) {
      if (block.type === "QuizzOption") {
        options.push({ value: block.value, isCorrect: block.isCorrect ?? false });
        continue;
      }
      if ("children" in block) {
        options = options.concat(extractFromBlocks(block.children));
      }
    }
    return options;
  }

  return extractFromBlocks(step.blocks);
}
