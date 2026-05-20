import { Box, css, Typography } from "@dldc/hono-ui";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";
import { ContentDisplay } from "./ContentDisplay.tsx";
import { QuestionOptions } from "./QuestionOptions.tsx";
import { RatioScreen } from "./RatioScreen.tsx";

interface DocStepProps {
  store: AppStore;
  session: Session;
}

export function DocStep({ store, session }: DocStepProps) {
  const currentSessionState = store.getCurrentSessionState(session.id);
  const currentStep = store.getCurrentStep();
  const quizz = store.getDoc();

  if (currentStep.type === "question") {
    return (
      <Box
        classList={css({
          display: "grid",
          gap: 4,
          gridTemplateRows: "1fr 1fr",
          media: { "@media (min-aspect-ratio: 3/2)": { gridTemplateRows: "auto", gridTemplateColumns: "1fr 1fr" } },
        })}
      >
        <RatioScreen ratio={quizz.ratio} center classList={css({ padding: 5, overflow: "hidden" })}>
          {currentStep.step === "explanation"
            ? <ContentDisplay content={currentStep.question.explanation ?? null} />
            : currentStep.step === "timesup"
            ? <Typography classList={css({ textAlign: "center" })} fontSize="[4rem]" fontWeight="bold">🥁 🥁 🥁 🥁 🥁</Typography>
            : <ContentDisplay content={currentStep.question.question} />}
        </RatioScreen>
        <RatioScreen ratio={quizz.ratio} classList={css({ overflow: "hidden" })}>
          <QuestionOptions
            options={currentStep.question.options}
            layout={currentStep.question.layout}
            selectedOptionIndex={currentSessionState?.vote}
            showAnswer={currentStep.step === "answer" || currentStep.step === "explanation"}
          />
        </RatioScreen>
      </Box>
    );
  }

  if (currentStep.type === "slide") {
    return (
      <RatioScreen ratio={quizz.ratio} center classList={css({ padding: 5, overflow: "hidden" })}>
        <ContentDisplay content={currentStep.slide.content} />
      </RatioScreen>
    );
  }

  currentStep satisfies never;
  return null;
}
