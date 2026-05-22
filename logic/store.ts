import { createSubscription, type SubscribeMethod } from "@dldc/pubsub";
import { resolve } from "@std/path";
import type { AdminAction } from "./adminActionSchema.ts";
import { type Block, type Doc, parseDoc, type Step } from "./parseDoc.ts";
import type { Session } from "./sessions.ts";
import type { UserAction } from "./userActionSchema.ts";
import { restore, sanitize } from "./zenjson.ts";

export type AppAction = {
  session: Session;
  action: AdminAction | UserAction;
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
  | { type: "question"; stepIndex: number; questionIndex: number; phase: "question" | "answer"; options: Options; step: Step }
  | { type: "slide"; stepIndex: number; step: Step };

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
}

export async function createAppStore(
  dataPath: string,
  storageKey: string,
): Promise<AppStore> {
  await ensureDataFolder(dataPath);
  const doc = await parseDoc(resolve(dataPath, "data.doc.tsx"));
  const sub = createSubscription<AppEvent>();
  let state: AppState = loadState(storageKey, doc);

  const allProgress = computeAllProgress(state.doc);

  return {
    subscribe: sub.subscribe,
    dispatch,
    getState: () => state,
    getDoc: () => state.doc,
    getCurrentProgress,
    getCurrentSessionState,
    getCurrentQuestionStats,
  };

  function dispatch({ action, session }: AppAction) {
    if (action.type === "Reset") {
      state = createInitialAppState(state.doc);
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "All" }, topic: "Status" });
      saveState(state, storageKey);
      return;
    }

    if (action.type === "Start") {
      if (state.state !== "idle") {
        return;
      }
      state.state = "running";
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "Admin" }, topic: "Status" });
      saveState(state, storageKey);
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
      saveState(state, storageKey);
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
      saveState(state, storageKey);
      sub.emit({ audience: { type: "All" }, topic: "Quizz" });
      sub.emit({ audience: { type: "Admin" }, topic: "Status" });
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
      saveState(state, storageKey);
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
      saveState(state, storageKey);
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
}

function saveState(state: AppState, storageKey: string) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(sanitize(state)));
  } catch (err) {
    console.error("Failed to save app state to localStorage", err);
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

function loadState(storageKey: string, doc: Doc): AppState {
  const data = localStorage.getItem(storageKey);
  if (!data) {
    return createInitialAppState(doc);
  }
  try {
    const restored = restore(JSON.parse(data)) as AppState;
    return { ...restored, doc: doc };
  } catch (err) {
    console.error("Failed to parse app state from localStorage", err);
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
    if (options.length === 0) {
      steps.push({ stepIndex: index, type: "slide", step });
      return;
    }
    steps.push({ stepIndex: index, type: "question", questionIndex, options, phase: "question", step });
    steps.push({ stepIndex: index, type: "question", questionIndex, options, phase: "answer", step });
    questionIndex++;
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
