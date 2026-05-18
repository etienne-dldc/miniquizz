import { Stack } from "@dldc/hono-ui";
import type { QuizzContent } from "../logic/quizzSchema.ts";
import { QuizzContentBlockDisplay } from "./ContentDisplay/QuizzContentBlockDisplay.tsx";

interface ContentDisplayProps {
  content: QuizzContent;
}

export const ContentDisplay = (
  { content }: ContentDisplayProps,
) => {
  if (content.length === 0) {
    return null;
  }
  return (
    <Stack flexDirection="column" gap={4} alignItems="center">
      {content.map((block, index) => <QuizzContentBlockDisplay key={index} block={block} />)}
    </Stack>
  );
};
