import { isDocElement, parse as parseTsxDoc } from "@dldc/tsx-doc";
import * as v from "@valibot/valibot";

const ALL_FONT_WEIGHTS = ["thin", "extraLight", "light", "normal", "medium", "semibold", "bold", "extraBold", "black"] as const;
const ALL_TEXT_DECORATIONS = ["underline", "overline", "lineThrough"] as const;
const ALL_FONT_FAMILIES = ["sans", "serif", "mono"] as const;

export interface InlineBlock_Br {
  type: "Br";
}

export interface InlineBlock_Span {
  type: "Span";
  inline: InlineBlocks;
  fontWeight?: (typeof ALL_FONT_WEIGHTS)[number];
  textDecoration?: (typeof ALL_TEXT_DECORATIONS)[number];
  fontFamily?: (typeof ALL_FONT_FAMILIES)[number];
}

export interface InlineBlock_Link {
  type: "Link";
  inline: InlineBlocks;
  href: string;
  openInNewTab?: boolean;
}

export type InlineBlock = string | InlineBlock_Br | InlineBlock_Span | InlineBlock_Link;
export type InlineBlocks = InlineBlock[];

export interface Block_Text {
  type: "Text";
  inline: InlineBlocks;
  size: number;
  centered?: boolean;
  fontWeight?: (typeof ALL_FONT_WEIGHTS)[number];
  textDecoration?: (typeof ALL_TEXT_DECORATIONS)[number];
  fontFamily?: (typeof ALL_FONT_FAMILIES)[number];
}

export interface Block_Code {
  type: "Code";
  code: string | string[];
  size: number;
  wrapSize?: number;
  language?: string;
}

export interface Block_Image {
  type: "Image";
  src: string;
  alt: string;
  size: number;
}

export interface Block_QuizzOption {
  type: "QuizzOption";
  children: Block[];
  value: string;
  isCorrect?: boolean;
}

export interface Block_Grid {
  type: "Grid";
  children: Block[];
  columns?: string;
  rows?: string;
  gap?: number;
}

export interface Block_Box {
  type: "Box";
  children: Block[];
  gap?: number;
}

export interface Block_Appear {
  type: "Appear";
  children: Block[];
  offset: number;
}

export type Block = Block_Text | Block_Code | Block_Image | Block_QuizzOption | Block_Grid | Block_Box | Block_Appear;

export interface Doc {
  name: string;
  description: string;
  ratio: number;
  steps: Step[];
}

export interface Step {
  blocks: Block[];
  maxAppearOffset: number;
}

const configAttrSchema = v.object({
  name: v.string(),
  description: v.string(),
  ratio: v.number(),
});

const blockTextAttrSchema = v.object({
  size: v.optional(v.pipe(v.number(), v.minValue(0)), 1),
  centered: v.optional(v.boolean(), true),
  fontWeight: v.optional(v.picklist(ALL_FONT_WEIGHTS)),
  textDecoration: v.optional(v.picklist(ALL_TEXT_DECORATIONS)),
  fontFamily: v.optional(v.picklist(ALL_FONT_FAMILIES)),
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
    const steps: Step[] = [];
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
        steps.push(parsed.step);
        continue;
      }
      parsed satisfies never;
    }
    if (config === null) {
      throw new Error("No Config element found in doc");
    }
    if (steps.length === 0) {
      throw new Error("No Step element found in doc, at least one is required");
    }
    return {
      name: config.name,
      description: config.description,
      ratio: config.ratio,
      steps,
    };
  } catch (err) {
    throw new Error(`Failed to read or parse doc file at ${path}`, {
      cause: err,
    });
  }
}

function parseRootBlock(
  element: unknown,
): { kind: "step"; step: Step } | { kind: "config"; config: v.InferOutput<typeof configAttrSchema> } {
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
    if (element.attributes) {
      throw new Error("Step element cannot have attributes");
    }
    const appearStore = createAppearStore();
    const blocks = parseChildrensToBlocks(element.children, { allowQuizzOption: true, appearStore });
    return { kind: "step", step: { blocks, maxAppearOffset: appearStore.getMaxOffset() } };
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
