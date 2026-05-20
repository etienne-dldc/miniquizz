import { createSubscription, type SubscribeMethod } from "@dldc/pubsub";
import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import type { AdminAction } from "./adminActionSchema.ts";
import { type Doc, docSchema, type StepQuestion, type StepSlide } from "./docSchema.ts";
import type { Session } from "./sessions.ts";
import type { UserAction } from "./userActionSchema.ts";
import { restore, sanitize } from "./zenjson.ts";

export type AppAction = {
  session: Session;
  action: AdminAction | UserAction;
};

export type AppEvent =
  | { type: "All" }
  | { type: "User"; sessionId: string }
  | { type: "Admin" };

export type AppSessionState = {
  isAdmin?: boolean;
  votes: Map<number, number>;
};

export type AppStateProgress = {
  index: number;
  kind: "question";
  step: "question" | "timesup" | "answer" | "explanation";
} | {
  index: number;
  kind: "slide";
};

export type CurrentStep =
  | { type: "question"; index: number; step: "question" | "timesup" | "answer" | "explanation"; question: StepQuestion }
  | { type: "slide"; index: number; slide: StepSlide };

export interface AppState {
  state: "running" | "idle";
  doc: Doc;
  progress: number;
  sessions: Map<string, AppSessionState>;
}

export interface CurrentSessionState {
  isAdmin?: boolean;
  vote: number | null;
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
  getCurrentStep: () => CurrentStep;
  getCurrentSessionState: (sessionId: string) => CurrentSessionState | null;
  getCurrentQuestionStats: () => CurrentQuestionStats;
}

export async function createAppStore(
  dataPath: string,
  storageKey: string,
): Promise<AppStore> {
  await ensureDataFolder(dataPath);
  const doc = await readDataFile(dataPath);
  const sub = createSubscription<AppEvent>();
  let state: AppState = loadState(storageKey, doc);
  const allSteps = computeAllSteps(state.doc);

  return {
    subscribe: sub.subscribe,
    dispatch,
    getState: () => state,
    getDoc: () => state.doc,
    getCurrentStep,
    getCurrentSessionState,
    getCurrentQuestionStats,
  };

  function dispatch({ action, session }: AppAction) {
    if (action.type === "Reset") {
      state = createInitialAppState(state.doc);
      sub.emit({ type: "All" });
      saveState(state, storageKey);
      return;
    }

    if (action.type === "Start") {
      if (state.state !== "idle") {
        return;
      }
      state.state = "running";
      sub.emit({ type: "All" });
      saveState(state, storageKey);
      return;
    }

    if (action.type === "Next") {
      if (state.state !== "running") {
        return;
      }
      if (state.progress >= allSteps.length - 1) {
        return;
      }
      state.progress += 1;
      saveState(state, storageKey);
      sub.emit({ type: "All" });
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
      sub.emit({ type: "All" });
      return;
    }

    if (action.type === "Vote") {
      const step = getCurrentStep();
      if (step.type !== "question") {
        return;
      }
      if (step.step !== "question" && step.step !== "timesup") {
        return;
      }
      if (action.optionIndex < 0 || action.optionIndex >= step.question.options.length) {
        return;
      }
      let sessionState = state.sessions.get(session.id);
      if (!sessionState) {
        sessionState = { votes: new Map(), isAdmin: session.isAdmin };
        state.sessions.set(session.id, sessionState);
      }
      sessionState.votes.set(step.index, action.optionIndex);
      saveState(state, storageKey);
      sub.emit({ type: "User", sessionId: session.id });
      sub.emit({ type: "Admin" });
      return;
    }

    action satisfies never;
  }

  function getCurrentStep(): CurrentStep {
    const stepState = allSteps[state.progress];
    const step = state.doc.steps[stepState.index];

    if (stepState.kind === "question") {
      if (step.type !== "question") {
        throw new Error(`Invalid state: expected question step at index ${stepState.index}`);
      }
      return { type: "question", index: stepState.index, question: step, step: stepState.step };
    }
    if (stepState.kind === "slide") {
      if (step.type !== "slide") {
        throw new Error(`Invalid state: expected slide step at index ${stepState.index}`);
      }
      return { type: "slide", index: stepState.index, slide: step };
    }
    stepState satisfies never;
    throw new Error(`Invalid state: unknown step kind`);
  }

  function getCurrentSessionState(sessionId: string): CurrentSessionState | null {
    const sessionState = state.sessions.get(sessionId);
    if (!sessionState) {
      return null;
    }
    return {
      isAdmin: sessionState.isAdmin,
      vote: sessionState.votes.get(state.progress) ?? null,
    };
  }

  function getCurrentQuestionStats(): CurrentQuestionStats {
    const totalUsers = Array.from(state.sessions.values()).filter((sessionState) => !sessionState.isAdmin).length;
    const currentStep = getCurrentStep();
    if (currentStep.type !== "question") {
      return { totalUsers, totalVotes: 0 };
    }
    const totalVotes = Array.from(state.sessions.values()).reduce((acc, sessionState) => {
      if (sessionState.isAdmin) {
        return acc;
      }
      const vote = sessionState.votes.get(currentStep.index);
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

async function readDataFile(dataPath: string): Promise<Doc> {
  const dataFilePath = resolve(dataPath, "data.json");
  try {
    const content = await Deno.readTextFile(dataFilePath);
    const dataUnkown = JSON.parse(content);
    return v.parse(docSchema, dataUnkown);
  } catch (err) {
    throw new Error(`Failed to read or parse app file at ${dataFilePath}`, {
      cause: err,
    });
  }
}

function computeAllSteps(doc: Doc): AppStateProgress[] {
  const steps: AppStateProgress[] = [];
  doc.steps.forEach((step, index) => {
    if (step.type === "question") {
      steps.push({ index, kind: "question", step: "question" });
      steps.push({ index, kind: "question", step: "timesup" });
      steps.push({ index, kind: "question", step: "answer" });
      if (step.explanation) {
        steps.push({ index, kind: "question", step: "explanation" });
      }
      return;
    }
    if (step.type === "slide") {
      steps.push({ index, kind: "slide" });
      return;
    }
    step satisfies never;
  });
  return steps;
}
