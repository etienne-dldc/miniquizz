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
    const textContent = Array.isArray(block.text) ? block.text.join("\n") : block.text;
    return (
      <Typography classList={css({ fontSize: `[${block.size}rem]`, textAlign: block.centered ? "center" : "left" })}>
        {textContent.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </Typography>
    );
  }
  if (block.type === "image") {
    return <img class={css({ maxWidth: "full", height: `[${block.size}rem]` })} src={block.src} alt={block.alt} />;
  }
  if (block.type === "code") {
    const codeContent = Array.isArray(block.code) ? block.code.join("\n") : block.code;
    const codeHtml = await codeToHtml(codeContent, {
      lang: "typescript",
      theme: "github-dark",
      rootStyle: "background-color: transparent;",
    });
    return <Box classList={css({ fontSize: `[${block.size}rem]` })} dangerouslySetInnerHTML={{ __html: codeHtml }} />;
  }
  block satisfies never;
  return <span />;
};
