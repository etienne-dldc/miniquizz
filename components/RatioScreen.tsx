import { Box, css } from "@dldc/hono-ui";
import type { Child } from "hono/jsx";

interface RatioScreenProps {
  ratio: number;
  children: Child;
}

export const RatioScreen = (
  { ratio, children }: RatioScreenProps,
) => {
  return (
    <Box data-autofit class={css({ overflow: "hidden" })}>
      <div
        class={css({
          width: `${ratio * 1000}px`,
          height: "1000px",
          position: "absolute",
          background: "white/5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 5,
          cornerShape: "superellipse",
        })}
      >
        {children}
      </div>
    </Box>
  );
};
