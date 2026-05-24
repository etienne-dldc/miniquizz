import type { InlineBlock } from "../../logic/parseDoc.ts";
import { InlineBlockLinkDisplay } from "./InlineBlockLinkDisplay.tsx";
import { InlineBlockSpanDisplay } from "./InlineBlockSpanDisplay.tsx";

interface InlineBlockDisplayProps {
  inlineBlock: InlineBlock;
}

export function InlineBlockDisplay({ inlineBlock }: InlineBlockDisplayProps) {
  if (typeof inlineBlock === "string") {
    return <span>{inlineBlock}</span>;
  }
  switch (inlineBlock.type) {
    case "Span": {
      return <InlineBlockSpanDisplay inlineBlock={inlineBlock} />;
    }
    case "Link": {
      return <InlineBlockLinkDisplay inlineBlock={inlineBlock} />;
    }
    case "Br": {
      return <br />;
    }
    default: {
      inlineBlock satisfies never;
      return null;
    }
  }
}
