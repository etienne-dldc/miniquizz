import { Stack } from "@dldc/hono-ui";
import type { ContentBlocks } from "../logic/docSchema.ts";
import { ContentBlockDisplay } from "./ContentBlockDisplay.tsx";

interface ContentDisplayProps {
  content: ContentBlocks | null;
}

export const ContentDisplay = (
  { content }: ContentDisplayProps,
) => {
  if (!content || content.length === 0) {
    return null;
  }
  return (
    <Stack flexDirection="column" gap={4} alignItems="center">
      {content.map((block, index) => <ContentBlockDisplay key={index} block={block} />)}
    </Stack>
  );
};
