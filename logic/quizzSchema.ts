import * as v from "@valibot/valibot";

export const quizzContentBlockSchema = v.variant("type", [
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

export const quizzContentSchema = v.array(quizzContentBlockSchema);

export const quizzOptionSchema = v.object({
  content: quizzContentSchema,
  isCorrect: v.boolean(),
});

export const quizzQuestionLayoutSchema = v.picklist(["auto", "horizontal", "vertical"]);

export const quizzQuestionSchema = v.object({
  question: quizzContentSchema,
  options: v.array(quizzOptionSchema),
  explanation: v.optional(quizzContentSchema),
  layout: v.optional(quizzQuestionLayoutSchema),
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
export type QuizzQuestionLayout = v.InferOutput<typeof quizzQuestionLayoutSchema>;
export type Quizz = v.InferOutput<typeof quizzSchema>;
