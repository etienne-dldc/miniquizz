import type { Block } from "../logic/parseDoc.ts";
import { BlockBoxDisplay } from "./BlockDisplay/BlockBoxDisplay.tsx";
import { BlockCodeDisplay } from "./BlockDisplay/BlockCodeDisplay.tsx";
import { BlockGridDisplay } from "./BlockDisplay/BlockGridDisplay.tsx";
import { BlockImageDisplay } from "./BlockDisplay/BlockImageDisplay.tsx";
import { BlockQuizzOptionDisplay } from "./BlockDisplay/BlockQuizzOptionDisplay.tsx";
import { BlockTextDisplay } from "./BlockDisplay/BlockTextDisplay.tsx";

interface BlockDisplayProps {
  block: Block;
}

export function BlockDisplay({ block }: BlockDisplayProps) {
  switch (block.type) {
    case "Text":
      return <BlockTextDisplay block={block} />;
    case "Code":
      return <BlockCodeDisplay block={block} />;
    case "Image":
      return <BlockImageDisplay block={block} />;
    case "QuizzOption":
      return <BlockQuizzOptionDisplay block={block} />;
    case "Grid":
      return <BlockGridDisplay block={block} />;
    case "Box":
      return <BlockBoxDisplay block={block} />;
    default: {
      block satisfies never;
      return null;
    }
  }
}
