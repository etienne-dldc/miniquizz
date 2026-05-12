import { createSubscription, type SubscribeMethod } from "@dldc/pubsub";
import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import type { AdminAction } from "./adminActionSchema.ts";
import { type Quizz, quizzSchema } from "./quizzSchema.ts";

export type QuizzState = {
  state: "idle";
} | {
  state: "question";
};

export interface QuizzStore {
  quizz: Quizz;
  subscribe: SubscribeMethod<QuizzState>;
  adminDispatch: (action: AdminAction) => void;
}

export async function createQuizzStore(dataPath: string): Promise<QuizzStore> {
  await ensureDataFolder(dataPath);
  const quizz = await readQuizzFile(dataPath);

  const sub = createSubscription<QuizzState>();

  let state: QuizzState = { state: "idle" };

  function adminDispatch(action: AdminAction) {
    state = quizzReducer(state, action);
    sub.emit(state);
  }

  return {
    quizz,
    subscribe: sub.subscribe,
    adminDispatch,
  };
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

function quizzReducer(state: QuizzState, action: AdminAction): QuizzState {
  switch (action.type) {
    case "StartQuizz":
      return { state: "question" };
    case "RevealAnswer":
      return state;
    case "NextQuestion":
      return state;
  }
}
