import { css } from "@dldc/hono-ui";
import type { InlineBlock_Link } from "../../logic/parseDoc.ts";
import { InlineBlockDisplay } from "./InlineBlockDisplay.tsx";

interface InlineBlockLinkDisplayProps {
  inlineBlock: InlineBlock_Link;
}

export function InlineBlockLinkDisplay({ inlineBlock }: InlineBlockLinkDisplayProps) {
  return (
    <a
      href={inlineBlock.href}
      target={inlineBlock.openInNewTab ? "_blank" : undefined}
      class={css({ textDecoration: "underline", color: "blue-400" })}
    >
      {inlineBlock.inline.map((child, index) => <InlineBlockDisplay key={index} inlineBlock={child} />)}
    </a>
  );
}
