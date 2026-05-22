import { Box, css } from "@dldc/hono-ui";
import { codeToHtml } from "shiki";
import type { Block_Code } from "../../logic/parseDoc.ts";

interface BlockCodeDisplayProps {
  block: Block_Code;
}

export async function BlockCodeDisplay({ block }: BlockCodeDisplayProps) {
  console.log(block);

  let codeLines = Array.isArray(block.code) ? block.code : [block.code];
  console.log({ codeLines });

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
