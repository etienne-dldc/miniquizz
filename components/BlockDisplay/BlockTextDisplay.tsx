import { css, Typography } from "@dldc/hono-ui";
import { Fragment } from "@hono/hono/jsx";
import type { Block_Text } from "../../logic/parseDoc.ts";

interface BlockTextDisplayProps {
  block: Block_Text;
}

const codeClass = css({
  fontFamily: "mono",
  letterSpacing: "[0.1ch]",
  marginX: 1,
  color: "neutral-400",
});

export function BlockTextDisplay({ block }: BlockTextDisplayProps) {
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
