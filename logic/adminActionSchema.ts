import * as v from "@valibot/valibot";

export const adminActionSchema = v.variant("type", [
  v.object({
    type: v.literal("Start"),
  }),
  v.object({
    type: v.literal("Reset"),
  }),
  v.object({
    type: v.literal("Next"),
  }),
]);

export type AdminAction = v.InferOutput<typeof adminActionSchema>;
