import { Box, css, Typography } from "@dldc/hono-ui";
import { codeToHtml } from "shiki";
import type { QuizzContentBlock } from "../../logic/quizzSchema.ts";

interface QuizzContentBlockDisplayProps {
  block: QuizzContentBlock;
}

export const QuizzContentBlockDisplay = async (
  { block }: QuizzContentBlockDisplayProps,
) => {
  if (block.type === "text") {
    return <Typography fontSize="xl">{block.text}</Typography>;
  }
  if (block.type === "large-text") {
    return <Typography fontSize="3xl">{block.text}</Typography>;
  }
  if (block.type === "image") {
    return <img style={{ maxWidth: "80vw", maxHeight: "60vh" }} src={block.src} alt={block.alt} />;
  }
  if (block.type === "code-line") {
    const codeHtml = await codeToHtml(block.code, {
      lang: "typescript",
      theme: "github-dark",
      rootStyle: "background-color: transparent;",
    });
    return <Box class={css({ fontSize: "xl" })} dangerouslySetInnerHTML={{ __html: codeHtml }} />;
  }
  if (block.type === "code-block") {
    const codeHtml = await codeToHtml(block.code, {
      lang: "typescript",
      theme: "github-dark",
      rootStyle: "background-color: transparent;",
    });
    return (
      <Box
        class={css({ fontSize: "lg", padding: 2, cornerShape: "superellipse" })}
        dangerouslySetInnerHTML={{ __html: codeHtml }}
      />
    );
  }
  block satisfies never;
  return <span />;
};
