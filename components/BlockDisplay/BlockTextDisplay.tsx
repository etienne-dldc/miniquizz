import { css, Typography } from "@dldc/hono-ui";
import type { Block_Text } from "../../logic/parseDoc.ts";
import { InlineBlockDisplay } from "./InlineBlockDisplay.tsx";

interface BlockTextDisplayProps {
  block: Block_Text;
}

export function BlockTextDisplay({ block }: BlockTextDisplayProps) {
  return (
    <Typography
      classList={css({
        fontWeight: block.fontWeight,
        fontSize: `[${block.size}rem]`,
        textAlign: block.centered ? "center" : "left",
        textDecoration: block.textDecoration,
        fontFamily: block.fontFamily,
        fontStyle: block.fontStyle,
      })}
    >
      {block.inline.map((inlineBlock, index) => <InlineBlockDisplay key={index} inlineBlock={inlineBlock} />)}
    </Typography>
  );
}
