import * as v from "@valibot/valibot";

export const adminActionSchema = v.variant("type", [
  v.object({
    type: v.literal("StartQuizz"),
  }),
  v.object({
    type: v.literal("RevealAnswer"),
  }),
  v.object({
    type: v.literal("NextQuestion"),
  }),
]);

export type AdminAction = v.InferOutput<typeof adminActionSchema>;
