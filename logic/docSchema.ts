import * as v from "@valibot/valibot";

export const contentBlockSchema = v.variant("type", [
  v.object({
    type: v.literal("text"),
    text: v.union([v.string(), v.array(v.string())]),
    size: v.optional(v.number(), 2),
    centered: v.optional(v.boolean(), true),
  }),
  v.object({
    type: v.literal("code"),
    code: v.union([v.string(), v.array(v.string())]),
    size: v.optional(v.number(), 2),
    wrapSize: v.optional(v.number()),
  }),
  v.object({
    type: v.literal("image"),
    src: v.string(),
    alt: v.string(),
    size: v.optional(v.number(), 3),
  }),
]);

export const contentBlocksSchema = v.array(contentBlockSchema);

export const stepQuestionOptionSchema = v.object({
  content: contentBlocksSchema,
  isCorrect: v.boolean(),
});

export const stepQuestionLayoutSchema = v.picklist(["auto", "horizontal", "vertical"]);

export const stepSchema = v.variant("type", [
  v.object({
    type: v.literal("question"),
    question: contentBlocksSchema,
    options: v.array(stepQuestionOptionSchema),
    explanation: v.optional(contentBlocksSchema),
    layout: v.optional(stepQuestionLayoutSchema),
  }),
  v.object({
    type: v.literal("slide"),
    content: contentBlocksSchema,
  }),
]);

export const docSchema = v.object({
  name: v.string(),
  description: v.string(),
  steps: v.array(stepSchema),
  // ration of the screen to display questions
  ratio: v.number(),
});

export type ContentBlock = v.InferOutput<typeof contentBlockSchema>;
export type ContentBlocks = v.InferOutput<typeof contentBlocksSchema>;
export type StepQuestionOption = v.InferOutput<typeof stepQuestionOptionSchema>;
export type Step = v.InferOutput<typeof stepSchema>;
export type StepQuestion = Extract<Step, { type: "question" }>;
export type StepSlide = Extract<Step, { type: "slide" }>;
export type StepQuestionLayout = v.InferOutput<typeof stepQuestionLayoutSchema>;
export type Doc = v.InferOutput<typeof docSchema>;
