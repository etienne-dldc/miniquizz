import * as v from "@valibot/valibot";

export const quizzContentBlockSchema = v.variant("type", [
  v.object({
    type: v.literal("text"),
    text: v.string(),
  }),
  v.object({
    type: v.literal("large-text"),
    text: v.string(),
  }),
  v.object({
    type: v.literal("code-line"),
    code: v.string(),
  }),
  v.object({
    type: v.literal("code-block"),
    code: v.string(),
  }),
  v.object({
    type: v.literal("image"),
    src: v.string(),
    alt: v.string(),
  }),
]);

export const quizzContentSchema = v.array(quizzContentBlockSchema);

export const quizzOptionSchema = v.object({
  content: quizzContentSchema,
  isCorrect: v.boolean(),
});

export const quizzQuestionSchema = v.object({
  question: quizzContentSchema,
  options: v.array(quizzOptionSchema),
  explanation: v.optional(quizzContentSchema),
});

export const quizzSchema = v.object({
  name: v.string(),
  description: v.string(),
  questions: v.array(quizzQuestionSchema),
  // ration of the screen to display questions
  ratio: v.number(),
});

export type QuizzContentBlock = v.InferOutput<typeof quizzContentBlockSchema>;
export type QuizzContent = v.InferOutput<typeof quizzContentSchema>;
export type QuizzOption = v.InferOutput<typeof quizzOptionSchema>;
export type QuizzQuestion = v.InferOutput<typeof quizzQuestionSchema>;
export type Quizz = v.InferOutput<typeof quizzSchema>;
