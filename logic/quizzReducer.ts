import { enableArrayMethods, enableMapSet, produce } from "immer";
import type { AdminAction } from "./adminActionSchema.ts";
import type { Quizz } from "./quizzSchema.ts";
import type { Session } from "./sessions.ts";
import type { UserAction } from "./userActionSchema.ts";

enableMapSet();
enableArrayMethods;

export type QuizzSessionState = {
  vote: number | null;
  points: number;
};

export type QuizzState =
  | { state: "idle"; quizz: Quizz }
  | { state: "running"; quizz: Quizz; questionIndex: number; sessions: Record<string, QuizzSessionState | undefined> };

export type QuizzAction = {
  session: Session;
  action: AdminAction | UserAction;
};

export type QuizzEvent =
  | { type: "All" }
  | { type: "User"; sessionId: string }
  | { type: "Admin" };

export function quizzReducer(
  state: QuizzState,
  { action, session }: QuizzAction,
): [state: QuizzState, events: QuizzEvent[]] {
  if (action.type === "Reset") {
    return [{ state: "idle", quizz: state.quizz }, [{ type: "All" }]];
  }

  if (action.type === "Start") {
    if (state.state !== "idle") {
      return [state, []];
    }
    return [
      { state: "running", quizz: state.quizz, questionIndex: 0, sessions: {} },
      [{ type: "All" }],
    ];
  }

  if (action.type === "Next") {
    if (state.state !== "running") {
      return [state, []];
    }
    const nextIndex = state.questionIndex + 1;
    if (nextIndex >= state.quizz.questions.length) {
      return [state, []];
    }
    // reset votes
    const nextSessions: Record<string, QuizzSessionState | undefined> = {};
    for (const [sessionId, sessionState] of Object.entries(state.sessions)) {
      if (!sessionState) {
        continue;
      }
      nextSessions[sessionId] = { ...sessionState, vote: null };
    }
    return [
      { ...state, questionIndex: nextIndex, sessions: nextSessions },
      [{ type: "All" }],
    ];
  }

  if (action.type === "Vote") {
    if (state.state !== "running") {
      return [state, []];
    }
    // make sure optionIndex is valid
    if (
      action.optionIndex < 0 ||
      action.optionIndex >=
        state.quizz.questions[state.questionIndex].options.length
    ) {
      return [state, []];
    }
    const nextState = produce(state, (draft) => {
      if (draft.state !== "running") {
        return;
      }
      const sessionState = draft.sessions[session.id] || {
        vote: null,
        points: 0,
      };
      sessionState.vote = action.optionIndex;
      draft.sessions[session.id] = sessionState;
    });
    if (nextState !== state) {
      return [nextState, [{ type: "User", sessionId: session.id }]];
    }
    return [state, []];
  }

  return [state, []];
  // switch (action.type) {
  //   case "StartQuizz":
  //     return { state: "question" };
  //   case "RevealAnswer":
  //     return state;
  //   case "NextQuestion":
  //     return state;
  // }
}
