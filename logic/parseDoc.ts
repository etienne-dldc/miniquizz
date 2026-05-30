import { isDocElement, parse as parseTsxDoc } from "@dldc/tsx-doc";
import * as v from "@valibot/valibot";
import {
  ALL_FONT_FAMILIES,
  ALL_FONT_STYLES,
  ALL_FONT_WEIGHTS,
  ALL_TEXT_DECORATIONS,
  type AppearProps,
  type BoxProps,
  type CodeProps,
  type ConfigProps,
  type GridProps,
  type ImageProps,
  type LinkProps,
  type QuizzOptionProps,
  type SpanProps,
  type TextProps,
} from "../tsx.ts";

type WithoutChildren<T> = Omit<T, "children">;

export interface InlineBlock_Br {
  type: "Br";
}

export type InlineBlock_Span = WithoutChildren<SpanProps> & {
  type: "Span";
  inline: InlineBlocks;
};

export type InlineBlock_Link = WithoutChildren<LinkProps> & {
  type: "Link";
  inline: InlineBlocks;
};

export type InlineBlock_InlineCode = {
  type: "InlineCode";
  content: string | string[];
};

export type InlineBlock = string | InlineBlock_Br | InlineBlock_Span | InlineBlock_Link | InlineBlock_InlineCode;
export type InlineBlocks = InlineBlock[];

export type Block_Text = WithoutChildren<TextProps> & {
  type: "Text";
  inline: InlineBlocks;
};

export type Block_Code = WithoutChildren<CodeProps> & {
  type: "Code";
  code: string | string[];
};

export type Block_Image = ImageProps & {
  type: "Image";
};

export type Block_QuizzOption = WithoutChildren<QuizzOptionProps> & {
  type: "QuizzOption";
  children: Block[];
};

export type Block_Grid = WithoutChildren<GridProps> & {
  type: "Grid";
  children: Block[];
};

export type Block_Box = WithoutChildren<BoxProps> & {
  type: "Box";
  children: Block[];
};

export type Block_Appear = Omit<AppearProps, "children" | "offset"> & {
  type: "Appear";
  children: Block[];
  offset: number;
};

export type Block = Block_Text | Block_Code | Block_Image | Block_QuizzOption | Block_Grid | Block_Box | Block_Appear;

export type Doc = ConfigProps & {
  slides: Slide[];
};

export interface Step {
  kind: "Step";
  blocks: Block[];
  maxAppearOffset: number;
  mode?: "live" | "build";
}

export interface Leaderboard {
  kind: "Leaderboard";
}

export type Slide = Step | Leaderboard;

const configAttrSchema = v.object({
  name: v.string(),
  description: v.string(),
  ratio: v.number(),
});

const stepAttrSchema = v.object({
  mode: v.optional(v.picklist(["live", "build"])),
});

const blockTextAttrSchema = v.object({
  size: v.optional(v.pipe(v.number(), v.minValue(0)), 1),
  centered: v.optional(v.boolean(), true),
  fontWeight: v.optional(v.picklist(ALL_FONT_WEIGHTS)),
  textDecoration: v.optional(v.picklist(ALL_TEXT_DECORATIONS)),
  fontFamily: v.optional(v.picklist(ALL_FONT_FAMILIES)),
  fontStyle: v.optional(v.picklist(ALL_FONT_STYLES)),
});

const blockCodeAttrSchema = v.object({
  size: v.optional(v.pipe(v.number(), v.minValue(0)), 1),
  wrapSize: v.optional(v.pipe(v.number(), v.minValue(0))),
  language: v.optional(v.string()),
});

const blockImageAttrSchema = v.object({
  size: v.optional(v.pipe(v.number(), v.minValue(0)), 1),
  alt: v.string(),
  src: v.string(),
});

const blockQuizzOptionAttrSchema = v.object({
  value: v.string(),
  isCorrect: v.optional(v.boolean(), false),
});

const blockGridAttrSchema = v.object({
  columns: v.optional(v.string()),
  rows: v.optional(v.string()),
  gap: v.optional(v.pipe(v.number(), v.minValue(0)), 5),
});

const blockBoxAttrSchema = v.object({
  gap: v.optional(v.pipe(v.number(), v.minValue(0))),
});

const blockAppearAttrSchema = v.object({
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
});

const inlineBlockSpanAttrSchema = v.object({
  fontWeight: v.optional(v.picklist(ALL_FONT_WEIGHTS)),
  textDecoration: v.optional(v.picklist(ALL_TEXT_DECORATIONS)),
  fontFamily: v.optional(v.picklist(ALL_FONT_FAMILIES)),
  fontStyle: v.optional(v.picklist(ALL_FONT_STYLES)),
});

const inlineBlockLinkAttrSchema = v.object({
  href: v.string(),
  openInNewTab: v.optional(v.boolean(), false),
});

export async function parseDoc(path: string): Promise<Doc> {
  try {
    const content = await Deno.readTextFile(path);
    const docBase = parseTsxDoc(content);
    let config: { name: string; description: string; ratio: number } | null = null;
    const slides: Slide[] = [];
    for (const child of docBase.children) {
      const parsed = parseRootBlock(child);
      if (parsed.kind === "config") {
        if (config) {
          throw new Error("Multiple Config elements found in doc, only one is allowed");
        }
        config = parsed.config;
        continue;
      }
      if (parsed.kind === "step") {
        slides.push(parsed.step);
        continue;
      }
      if (parsed.kind === "leaderboard") {
        slides.push({ kind: "Leaderboard" });
        continue;
      }
      parsed satisfies never;
    }
    if (config === null) {
      throw new Error("No Config element found in doc");
    }
    if (slides.length === 0) {
      throw new Error("No Step element found in doc, at least one is required");
    }
    return {
      name: config.name,
      description: config.description,
      ratio: config.ratio,
      slides,
    };
  } catch (err) {
    throw new Error(`Failed to read or parse doc file at ${path}`, {
      cause: err,
    });
  }
}

type RootBlock = { kind: "step"; step: Step } | { kind: "config"; config: v.InferOutput<typeof configAttrSchema> } | {
  kind: "leaderboard";
};

function parseRootBlock(
  element: unknown,
): RootBlock {
  if (!isDocElement(element)) {
    throw new Error("Unexpected text node in doc, only Config and Step elements are allowed at the top level");
  }
  if (element.name === "Config") {
    if (element.children) {
      throw new Error("Config element cannot have children");
    }
    const attrs = v.parse(configAttrSchema, element.attributes);
    return { kind: "config", config: attrs };
  }
  if (element.name === "Step") {
    const attrs = v.parse(stepAttrSchema, element.attributes ?? {});
    const appearStore = createAppearStore();
    const blocks = parseChildrensToBlocks(element.children, { allowQuizzOption: true, appearStore });
    return { kind: "step", step: { kind: "Step", blocks, maxAppearOffset: appearStore.getMaxOffset(), mode: attrs.mode } };
  }
  if (element.name === "Leaderboard") {
    if (element.attributes) {
      throw new Error("Leaderboard element cannot have attributes");
    }
    if (element.children) {
      throw new Error("Leaderboard element cannot have children");
    }
    return { kind: "leaderboard" };
  }
  throw new Error(
    `Unexpected element ${element.name} in doc`,
  );
}

function parseChildrensToBlocks(
  children: unknown[] | undefined,
  options: { allowQuizzOption: boolean; appearStore: AppearStore },
): Block[] {
  if (!children) {
    return [];
  }
  const blocks: Block[] = [];
  for (const child of children) {
    const block = parseChildrenToBlock(child, options);
    if (block) {
      blocks.push(block);
    }
  }
  return blocks;
}

function parseChildrenToBlock(children: unknown, options: { allowQuizzOption: boolean; appearStore: AppearStore }): Block | null {
  if (!isDocElement(children)) {
    throw new Error("Unexpected node: only elements are allowed");
  }
  if (children.name === "Text") {
    const inline = parseChildrensToInlineBlocks(children.children);
    const attrs = v.parse(blockTextAttrSchema, children.attributes ?? {});
    return { type: "Text", inline, ...attrs };
  }
  if (children.name === "Code") {
    const code = parseTextChildren(children.children);
    const attrs = v.parse(blockCodeAttrSchema, children.attributes ?? {});
    return { type: "Code", code, ...attrs };
  }
  if (children.name === "Image") {
    const attrs = v.parse(blockImageAttrSchema, children.attributes ?? {});
    if (children.children) {
      throw new Error("Image element cannot have children");
    }
    return { type: "Image", src: attrs.src, alt: attrs.alt, size: attrs.size ?? 1 };
  }
  if (children.name === "QuizzOption") {
    if (!options.allowQuizzOption) {
      throw new Error("Invalid nested QuizzOption element: QuizzOption elements cannot be nested inside other QuizzOption elements");
    }
    const attrs = v.parse(blockQuizzOptionAttrSchema, children.attributes ?? {});
    const blocks = parseChildrensToBlocks(children.children, { allowQuizzOption: false, appearStore: options.appearStore });
    return { type: "QuizzOption", children: blocks, ...attrs };
  }
  if (children.name === "Grid") {
    const attrs = v.parse(blockGridAttrSchema, children.attributes ?? {});
    const blocks = parseChildrensToBlocks(children.children, options);
    return { type: "Grid", children: blocks, ...attrs };
  }
  if (children.name === "Box") {
    const attrs = v.parse(blockBoxAttrSchema, children.attributes ?? {});
    const blocks = parseChildrensToBlocks(children.children, options);
    return { type: "Box", children: blocks, ...attrs };
  }
  if (children.name === "Appear") {
    const attrs = v.parse(blockAppearAttrSchema, children.attributes ?? {});
    const blocks = parseChildrensToBlocks(children.children, options);
    const offset = options.appearStore.add(attrs.offset);
    return { type: "Appear", children: blocks, offset };
  }
  throw new Error(`Unknown element: ${children.name}`);
}

function parseChildrensToInlineBlocks(children: unknown[] | undefined): InlineBlocks {
  if (!children) {
    return [];
  }
  const inlineBlocks: InlineBlocks = [];
  for (const child of children) {
    const inlineBlock = parseChildrenToInlineBlock(child);
    if (inlineBlock) {
      inlineBlocks.push(inlineBlock);
    }
  }
  return inlineBlocks;
}

function parseChildrenToInlineBlock(children: unknown): InlineBlock {
  if (typeof children === "string") {
    return children;
  }
  if (!isDocElement(children)) {
    throw new Error("Unexpected node: only text or elements are allowed inside Text elements");
  }
  if (children.name === "Br") {
    if (children.children) {
      throw new Error("Br element cannot have children");
    }
    if (children.attributes) {
      throw new Error("Br element cannot have attributes");
    }
    return { type: "Br" };
  }
  if (children.name === "Span") {
    const attrs = v.parse(inlineBlockSpanAttrSchema, children.attributes ?? {});
    const inline = parseChildrensToInlineBlocks(children.children);
    return { type: "Span", inline, ...attrs };
  }
  if (children.name === "Link") {
    const attrs = v.parse(inlineBlockLinkAttrSchema, children.attributes ?? {});
    const inline = parseChildrensToInlineBlocks(children.children);
    return { type: "Link", inline, ...attrs };
  }
  if (children.name === "InlineCode") {
    if (children.attributes) {
      throw new Error("InlineCode element cannot have attributes");
    }
    const content = parseTextChildren(children.children);
    return { type: "InlineCode", content };
  }
  throw new Error(`Unknown element: ${children.name}`);
}

function parseTextChildren(children: unknown[] | undefined): string | string[] {
  if (!children) {
    return "";
  }
  const texts: string[] = [];
  for (const child of children) {
    if (typeof child === "string") {
      texts.push(child);
    } else {
      throw new Error("Unexpected node in Text or Code element: only text nodes are allowed");
    }
  }
  if (texts.length === 0) {
    return "";
  }
  if (texts.length === 1) {
    return texts[0];
  }
  return texts;
}

interface AppearStore {
  add(offset?: number): number;
  getMaxOffset(): number;
}

function createAppearStore(): AppearStore {
  let currentOffset = 0;
  return {
    add(offset) {
      if (offset === undefined) {
        currentOffset++;
        return currentOffset;
      }
      currentOffset = Math.max(currentOffset, offset);
      return offset;
    },
    getMaxOffset() {
      return currentOffset;
    },
  };
}
