import type { AdminAction } from "./adminActionSchema.ts";
import type { Quizz } from "./quizzSchema.ts";
import type { UserAction } from "./userActionSchema.ts";

export type QuizzState =
  | { state: "idle"; quizz: Quizz }
  | { state: "running"; quizz: Quizz; questionIndex: number };

export type QuizzAction = AdminAction | UserAction;

export type QuizzEvent =
  | { type: "All" }
  | { type: "User"; sessionId: string }
  | { type: "Admin" };

export function quizzReducer(
  state: QuizzState,
  action: QuizzAction,
): [state: QuizzState, events: QuizzEvent[]] {
  if (action.type === "Reset") {
    return [{ state: "idle", quizz: state.quizz }, [{ type: "All" }]];
  }

  if (action.type === "Start") {
    if (state.state !== "idle") {
      return [state, []];
    }
    return [
      { state: "running", quizz: state.quizz, questionIndex: 0 },
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
    return [
      { ...state, questionIndex: nextIndex },
      [{ type: "All" }],
    ];
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
