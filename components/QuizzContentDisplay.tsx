import { Stack } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import type { QuizzContent } from "../logic/quizzSchema.ts";
import { QuizzContentBlockDisplay } from "./QuizzContentBlockDisplay.tsx";

interface QuizzContentDisplayProps {
  content: QuizzContent;
}

export const QuizzContentDisplay: FC<QuizzContentDisplayProps> = (
  { content },
) => {
  if (content.length === 0) {
    return null;
  }
  return (
    <Stack direction="column" gap={2} align="center">
      {content.map((block, index) => (
        <QuizzContentBlockDisplay key={index} block={block} />
      ))}
    </Stack>
  );
};
