import type { Block, Doc, Step } from "./parseDoc.ts";

export type Options = { value: string; isCorrect: boolean }[];

export type AppProgress =
  | {
    type: "question";
    stepIndex: number;
    appearOffset: number;
    questionIndex: number;
    phase: "question" | "answer";
    options: Options;
    step: Step;
  }
  | { type: "step"; stepIndex: number; appearOffset: number; step: Step }
  | { type: "leaderboard"; stepIndex: number };

export function computeAllProgress(doc: Doc, mode: "live" | "build"): AppProgress[] {
  const steps: AppProgress[] = [];
  let questionIndex = 0;
  doc.slides.forEach((slide, index) => {
    if (slide.kind === "Leaderboard") {
      steps.push({ type: "leaderboard", stepIndex: index });
      return;
    }
    if (slide.kind === "Step") {
      if (slide.mode && slide.mode !== mode) {
        return;
      }
      const options = extractOptions(slide);
      const base: AppProgress = options.length === 0
        ? { stepIndex: index, appearOffset: 0, type: "step", step: slide }
        : { stepIndex: index, appearOffset: 0, type: "question", questionIndex, options, phase: "question", step: slide };
      steps.push(base);
      for (let appearOffset = 1; appearOffset <= slide.maxAppearOffset; appearOffset++) {
        steps.push({ ...base, appearOffset });
      }
      if (options.length > 0) {
        steps.push({
          stepIndex: index,
          type: "question",
          appearOffset: slide.maxAppearOffset,
          questionIndex,
          options,
          phase: "answer",
          step: slide,
        });
        questionIndex++;
      }
      return;
    }
    slide satisfies never;
  });
  return steps;
}

function extractOptions(step: Step): { value: string; isCorrect: boolean }[] {
  function extractFromBlocks(blocks: Block[]): { value: string; isCorrect: boolean }[] {
    let options: { value: string; isCorrect: boolean }[] = [];
    for (const block of blocks) {
      if (block.type === "QuizzOption") {
        options.push({ value: block.value, isCorrect: block.isCorrect ?? false });
        continue;
      }
      if ("children" in block) {
        options = options.concat(extractFromBlocks(block.children));
      }
    }
    return options;
  }

  return extractFromBlocks(step.blocks);
}
