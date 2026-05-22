import { isDocElement, parse as parseTsxDoc } from "@dldc/tsx-doc";
import * as v from "@valibot/valibot";

export interface Block_Text {
  type: "Text";
  text: string | string[];
  size: number;
  centered?: boolean;
}

export interface Block_Code {
  type: "Code";
  code: string | string[];
  size: number;
  wrapSize?: number;
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
}

export type Block = Block_Text | Block_Code | Block_Image | Block_QuizzOption | Block_Grid | Block_Box;

export interface Doc {
  name: string;
  description: string;
  ratio: number;
  steps: Step[];
}

export interface Step {
  blocks: Block[];
}

const configAttrSchema = v.object({
  name: v.string(),
  description: v.string(),
  ratio: v.number(),
});

const blockTextAttrSchema = v.object({
  size: v.optional(v.pipe(v.number(), v.minValue(0)), 1),
  centered: v.optional(v.boolean()),
});

const blockCodeAttrSchema = v.object({
  size: v.optional(v.pipe(v.number(), v.minValue(0)), 1),
  wrapSize: v.optional(v.pipe(v.number(), v.minValue(0))),
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
    const blocks = parseChildrensToBlocks(element.children, { allowQuizzOption: true });
    return { kind: "step", step: { blocks } };
  }
  throw new Error(
    `Unexpected element ${element.name} in doc`,
  );
}

function parseChildrensToBlocks(children: unknown[] | undefined, options: { allowQuizzOption: boolean }): Block[] {
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

function parseChildrenToBlock(children: unknown, options: { allowQuizzOption: boolean }): Block | null {
  if (!isDocElement(children)) {
    throw new Error("Unexpected node: only elements are allowed");
  }
  if (children.name === "Text") {
    const text = parseTextChildren(children.children);
    const attrs = v.parse(blockTextAttrSchema, children.attributes ?? {});
    return { type: "Text", text, ...attrs };
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
    const blocks = parseChildrensToBlocks(children.children, { allowQuizzOption: false });
    return { type: "QuizzOption", children: blocks, ...attrs };
  }
  if (children.name === "Grid") {
    const attrs = v.parse(blockGridAttrSchema, children.attributes ?? {});
    const blocks = parseChildrensToBlocks(children.children, options);
    return { type: "Grid", children: blocks, ...attrs };
  }
  if (children.name === "Box") {
    if (children.attributes) {
      throw new Error("Box element cannot have attributes");
    }
    const blocks = parseChildrensToBlocks(children.children, options);
    return { type: "Box", children: blocks };
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
