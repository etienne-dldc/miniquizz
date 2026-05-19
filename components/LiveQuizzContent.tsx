import { Box, css, Typography } from "@dldc/hono-ui";
import type { QuizzState } from "../logic/quizzStore.ts";
import type { Session } from "../logic/sessions.ts";
import { ContentDisplay } from "./ContentDisplay.tsx";
import { QuestionOptions } from "./QuestionOptions.tsx";
import { RatioScreen } from "./RatioScreen.tsx";

interface LiveQuizzContentProps {
  state: QuizzState;
  session: Session;
}

export function LiveQuizzContent({ state, session }: LiveQuizzContentProps) {
  const currentQuestion = state.quizz.questions[state.progress.questionIndex];
  const sessionState = state.sessions.get(session.id);
  const currentVote = sessionState?.votes.get(state.progress.questionIndex);

  return (
    <Box
      classList={css({
        display: "grid",
        gap: 4,
        gridTemplateRows: "1fr 1fr",
        media: { "@media (min-aspect-ratio: 3/2)": { gridTemplateRows: "auto", gridTemplateColumns: "1fr 1fr" } },
      })}
    >
      <RatioScreen ratio={state.quizz.ratio} center classList={css({ padding: 5 })}>
        {state.progress.step === "explanation"
          ? <ContentDisplay content={currentQuestion.explanation ?? null} />
          : state.progress.step === "timesup"
          ? <Typography classList={css({ textAlign: "center" })} fontSize="[4rem]" fontWeight="bold">🥁 🥁 🥁 🥁 🥁</Typography>
          : <ContentDisplay content={currentQuestion.question} />}
      </RatioScreen>
      <RatioScreen ratio={state.quizz.ratio}>
        <QuestionOptions
          options={currentQuestion.options}
          layout={currentQuestion.layout}
          selectedOptionIndex={currentVote}
          showAnswer={state.progress.step === "answer" || state.progress.step === "explanation"}
        />
      </RatioScreen>
    </Box>
  );
}
