import * as v from "@valibot/valibot";

export const userActionSchema = v.variant("type", [
  v.object({
    type: v.literal("Vote"),
    optionValue: v.pipe(v.string(), v.nonEmpty()),
  }),
]);

export type UserAction = v.InferOutput<typeof userActionSchema>;
