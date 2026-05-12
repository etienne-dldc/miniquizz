import { Typography } from "@dldc/hono-ui";
import { codeToHtml } from "shiki";
import type { QuizzContentBlock } from "../logic/quizzSchema.ts";

interface QuizzContentBlockDisplayProps {
  block: QuizzContentBlock;
}

export const QuizzContentBlockDisplay = async (
  { block }: QuizzContentBlockDisplayProps,
) => {
  if (block.type === "text") {
    return <Typography textSize="xl">{block.text}</Typography>;
  }
  if (block.type === "image") {
    return <img src={block.src} alt={block.alt} />;
  }
  if (block.type === "code-line") {
    const codeHtml = await codeToHtml(block.code, {
      lang: "typescript",
      theme: "vitesse-dark",
      rootStyle: "background-color: transparent;",
    });
    return <div dangerouslySetInnerHTML={{ __html: codeHtml }} />;
  }
  if (block.type === "code-block") {
    const codeHtml = await codeToHtml(block.code, {
      lang: "typescript",
      theme: "vitesse-dark",
      rootStyle: "background-color: transparent;",
    });
    return <div dangerouslySetInnerHTML={{ __html: codeHtml }} />;
  }
  block satisfies never;
  return <span />;
};
