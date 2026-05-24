import { css } from "@dldc/hono-ui";
import type { InlineBlock_InlineCode } from "../../logic/parseDoc.ts";

interface InlineBlockInlineCodeDisplayProps {
  inlineBlock: InlineBlock_InlineCode;
}

const codeClass = css({
  fontFamily: "mono",
  letterSpacing: "[0.1ch]",
  marginX: 1,
  color: "neutral-400",
});

export function InlineBlockInlineCodeDisplay({ inlineBlock }: InlineBlockInlineCodeDisplayProps) {
  const content = typeof inlineBlock.content === "string" ? inlineBlock.content : inlineBlock.content.join("\n");
  return (
    <code class={codeClass}>
      {content}
    </code>
  );
}
