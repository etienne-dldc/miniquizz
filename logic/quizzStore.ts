import { createSubscription, type SubscribeMethod } from "@dldc/pubsub";
import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import type { AdminAction } from "./adminActionSchema.ts";
import { type Quizz, quizzSchema, type StepQuestion, type StepSlide } from "./quizzSchema.ts";
import type { Session } from "./sessions.ts";
import type { UserAction } from "./userActionSchema.ts";
import { restore, sanitize } from "./zenjson.ts";

export type QuizzAction = {
  session: Session;
  action: AdminAction | UserAction;
};

export type QuizzEvent =
  | { type: "All" }
  | { type: "User"; sessionId: string }
  | { type: "Admin" };

export type QuizzSessionState = {
  isAdmin?: boolean;
  votes: Map<number, number>;
};

export type QuizzStateProgress = {
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

export interface QuizzState {
  state: "running" | "idle";
  quizz: Quizz;
  progress: number;
  sessions: Map<string, QuizzSessionState>;
}

export interface CurrentSessionState {
  isAdmin?: boolean;
  vote: number | null;
}

export interface CurrentQuestionStats {
  totalUsers: number;
  totalVotes: number;
}

export interface QuizzStore {
  subscribe: SubscribeMethod<QuizzEvent>;
  dispatch: (action: QuizzAction) => void;
  getState: () => QuizzState;
  getQuizz: () => Quizz;
  getCurrentStep: () => CurrentStep;
  getCurrentSessionState: (sessionId: string) => CurrentSessionState | null;
  getCurrentQuestionStats: () => CurrentQuestionStats;
}

export async function createQuizzStore(
  dataPath: string,
  storageKey: string,
): Promise<QuizzStore> {
  await ensureDataFolder(dataPath);
  const quizz = await readDataFile(dataPath);
  const sub = createSubscription<QuizzEvent>();
  let state: QuizzState = loadState(storageKey, quizz);
  const allSteps = computeAllSteps(state.quizz);

  return {
    subscribe: sub.subscribe,
    dispatch,
    getState: () => state,
    getQuizz: () => state.quizz,
    getCurrentStep,
    getCurrentSessionState,
    getCurrentQuestionStats,
  };

  function dispatch({ action, session }: QuizzAction) {
    if (action.type === "Reset") {
      state = createInitialQuizzState(state.quizz);
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
    const step = state.quizz.steps[stepState.index];

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

function saveState(state: QuizzState, storageKey: string) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(sanitize(state)));
  } catch (err) {
    console.error("Failed to save quizz state to localStorage", err);
  }
}

function createInitialQuizzState(quizz: Quizz): QuizzState {
  return {
    state: "idle",
    quizz,
    progress: 0,
    sessions: new Map(),
  };
}

function loadState(storageKey: string, quizz: Quizz): QuizzState {
  const data = localStorage.getItem(storageKey);
  if (!data) {
    return createInitialQuizzState(quizz);
  }
  try {
    const restored = restore(JSON.parse(data)) as QuizzState;
    return { ...restored, quizz };
  } catch (err) {
    console.error("Failed to parse quizz state from localStorage", err);
    return createInitialQuizzState(quizz);
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

async function readDataFile(dataPath: string): Promise<Quizz> {
  const dataFilePath = resolve(dataPath, "data.json");
  try {
    const content = await Deno.readTextFile(dataFilePath);
    const dataUnkown = JSON.parse(content);
    return v.parse(quizzSchema, dataUnkown);
  } catch (err) {
    throw new Error(`Failed to read or parse quizz file at ${dataFilePath}`, {
      cause: err,
    });
  }
}

function computeAllSteps(quizz: Quizz): QuizzStateProgress[] {
  const steps: QuizzStateProgress[] = [];
  quizz.steps.forEach((step, index) => {
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
