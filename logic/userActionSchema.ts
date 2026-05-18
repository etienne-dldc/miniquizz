import * as v from "@valibot/valibot";

export const userActionSchema = v.variant("type", [
  v.object({
    type: v.literal("Vote"),
    optionIndex: v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(0)),
  }),
]);

export type UserAction = v.InferOutput<typeof userActionSchema>;
