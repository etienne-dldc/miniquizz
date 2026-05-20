import { Box, css, Typography } from "@dldc/hono-ui";
import { Fragment } from "hono/jsx";
import { codeToHtml } from "shiki";
import type { ContentBlock } from "../../logic/quizzSchema.ts";

interface QuizzContentBlockDisplayProps {
  block: ContentBlock;
}

const codeClass = css({
  fontFamily: "mono",
  letterSpacing: "[0.1ch]",
  marginX: 1,
  color: "neutral-400",
});

export const QuizzContentBlockDisplay = async (
  { block }: QuizzContentBlockDisplayProps,
) => {
  if (block.type === "text") {
    const textContent = Array.isArray(block.text) ? block.text.join("\n") : block.text;
    const textLines = textContent.split("\n");
    return (
      <Typography classList={css({ fontSize: `[${block.size}rem]`, textAlign: block.centered ? "center" : "left" })}>
        {textLines.map((line, index) => {
          const parts = line.split(/(`(?:\S[^`]*\S|\S)`)/g).filter((part) => part.length > 0);
          return (
            <Fragment key={String(index)}>
              {parts.map((part, partIndex) => {
                if (part.startsWith("`") && part.endsWith("`")) {
                  const code = part.slice(1, -1);
                  return <code key={partIndex} class={codeClass}>{code}</code>;
                }
                return <span key={partIndex}>{part}</span>;
              })}
              <br />
            </Fragment>
          );
        })}
      </Typography>
    );
  }
  if (block.type === "image") {
    return <img class={css({ maxWidth: "full", height: `[${block.size}rem]` })} src={block.src} alt={block.alt} />;
  }
  if (block.type === "code") {
    let codeLines = Array.isArray(block.code) ? block.code : [block.code];
    if (block.wrapSize && block.wrapSize > 0) {
      const wrappedLines: string[] = [];
      for (const line of codeLines) {
        if (line.length <= block.wrapSize) {
          wrappedLines.push(line);
        } else {
          let currentIndex = 0;
          while (currentIndex < line.length) {
            wrappedLines.push(line.slice(currentIndex, currentIndex + block.wrapSize));
            currentIndex += block.wrapSize;
          }
        }
      }
      codeLines = wrappedLines;
    }

    const codeHtml = await codeToHtml(codeLines.join("\n"), {
      lang: "typescript",
      theme: "github-dark",
      rootStyle: "background-color: transparent;",
    });
    return <Box classList={css({ fontSize: `[${block.size}rem]` })} dangerouslySetInnerHTML={{ __html: codeHtml }} />;
  }
  block satisfies never;
  return <span />;
};
