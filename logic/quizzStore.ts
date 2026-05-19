import { createSubscription, type SubscribeMethod } from "@dldc/pubsub";
import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import type { AdminAction } from "./adminActionSchema.ts";
import { type Quizz, quizzSchema } from "./quizzSchema.ts";
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

export interface QuizzStateProgress {
  questionIndex: number;
  step: "question" | "timesup" | "answer" | "explanation";
}

export interface QuizzState {
  state: "running" | "idle";
  quizz: Quizz;
  progress: QuizzStateProgress;
  sessions: Map<string, QuizzSessionState>;
}

export interface QuizzStore {
  subscribe: SubscribeMethod<QuizzEvent>;
  dispatch: (action: QuizzAction) => void;
  getState: () => QuizzState;
}

export async function createQuizzStore(
  dataPath: string,
  storageKey: string,
): Promise<QuizzStore> {
  await ensureDataFolder(dataPath);
  const quizz = await readQuizzFile(dataPath);
  const sub = createSubscription<QuizzEvent>();
  let state: QuizzState = loadState(storageKey, quizz);

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
      const nextProgress = computeNextProgress(state.progress, state.quizz);
      if (nextProgress === state.progress) {
        return;
      }
      state.progress = nextProgress;
      saveState(state, storageKey);
      sub.emit({ type: "All" });
      return;
    }

    if (action.type === "Prev") {
      if (state.state !== "running") {
        return;
      }
      const prevProgress = computePrevProgress(state.progress, state.quizz);
      if (prevProgress === state.progress) {
        return;
      }
      state.progress = prevProgress;
      saveState(state, storageKey);
      sub.emit({ type: "All" });
      return;
    }

    if (action.type === "Vote") {
      if (state.state !== "running") {
        return;
      }
      // make sure optionIndex is valid
      if (action.optionIndex < 0 || action.optionIndex >= state.quizz.questions[state.progress.questionIndex].options.length) {
        return;
      }
      if (state.progress.step !== "question" && state.progress.step !== "timesup") {
        return;
      }
      let sessionState = state.sessions.get(session.id);
      if (!sessionState) {
        sessionState = { votes: new Map(), isAdmin: session.isAdmin };
        state.sessions.set(session.id, sessionState);
      }
      sessionState.votes.set(state.progress.questionIndex, action.optionIndex);
      saveState(state, storageKey);
      sub.emit({ type: "User", sessionId: session.id });
      sub.emit({ type: "Admin" });
      return;
    }

    action satisfies never;
  }

  return {
    subscribe: sub.subscribe,
    dispatch,
    getState: () => state,
  };
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
    progress: { questionIndex: 0, step: "question" },
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

async function readQuizzFile(dataPath: string): Promise<Quizz> {
  const quizFillPath = resolve(dataPath, "quizz.json");
  try {
    const content = await Deno.readTextFile(quizFillPath);
    const dataUnkown = JSON.parse(content);
    return v.parse(quizzSchema, dataUnkown);
  } catch (err) {
    throw new Error(`Failed to read or parse quizz file at ${quizFillPath}`, {
      cause: err,
    });
  }
}

function computeNextProgress(progress: QuizzStateProgress, quizz: Quizz): QuizzStateProgress {
  if (progress.step === "question") {
    return { ...progress, step: "timesup" };
  }
  if (progress.step === "timesup") {
    return { ...progress, step: "answer" };
  }
  const currentQuestion = quizz.questions[progress.questionIndex];
  if (progress.step === "answer" && currentQuestion.explanation) {
    return { ...progress, step: "explanation" };
  }
  const nextIndex = progress.questionIndex + 1;
  if (nextIndex >= quizz.questions.length) {
    return progress;
  }
  return { questionIndex: nextIndex, step: "question" };
}

function computePrevProgress(progress: QuizzStateProgress, quizz: Quizz): QuizzStateProgress {
  if (progress.step === "explanation") {
    return { ...progress, step: "answer" };
  }
  if (progress.step === "answer") {
    return { ...progress, step: "timesup" };
  }
  if (progress.step === "timesup") {
    return { ...progress, step: "question" };
  }
  const prevIndex = progress.questionIndex - 1;
  if (prevIndex < 0) {
    return progress;
  }
  const prevQuestion = quizz.questions[prevIndex];
  const prevHasExplanation = !!prevQuestion.explanation;
  if (prevHasExplanation) {
    return { questionIndex: prevIndex, step: "explanation" };
  }
  return { questionIndex: prevIndex, step: "answer" };
}
