import { createSubscription, type SubscribeMethod } from "@dldc/pubsub";
import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import { type QuizzAction, type QuizzEvent, quizzReducer, type QuizzState } from "./quizzReducer.ts";
import { type Quizz, quizzSchema } from "./quizzSchema.ts";

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

  let state: QuizzState = loadState();

  function dispatch(action: QuizzAction) {
    const [newState, events] = quizzReducer(state, action);
    state = newState;
    saveState();
    if (events.some((e) => e.type === "All")) {
      sub.emit({ type: "All" });
      return;
    }
    for (const event of events) {
      sub.emit(event);
    }
  }

  return {
    subscribe: sub.subscribe,
    dispatch,
    getState: () => state,
  };

  function saveState() {
    const stateToSave = { ...state, quizz: undefined };
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (err) {
      console.error("Failed to save quizz state to localStorage", err);
    }
  }

  function loadState(): QuizzState {
    const data = localStorage.getItem(storageKey);
    if (!data) {
      return { state: "idle", quizz };
    }
    try {
      const dataUnknown = JSON.parse(data) as Omit<QuizzState, "quizz">;
      return { ...dataUnknown, quizz } as QuizzState;
    } catch (err) {
      console.error("Failed to parse quizz state from localStorage", err);
      return { state: "idle", quizz };
    }
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
