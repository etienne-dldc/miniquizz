import { Box, css } from "@dldc/hono-ui";
import type { Child } from "hono/jsx";

interface RatioScreenProps {
  ratio: number;
  children: Child;
  center?: boolean;
  class?: string | Promise<string>;
}

const SIZE = 400;

export const RatioScreen = (
  { ratio, children, center, class: className }: RatioScreenProps,
) => {
  return (
    <Box data-autofit class={css({ overflow: "hidden" })}>
      <Box
        class={[
          css(
            {
              width: `${ratio * SIZE}px`,
              height: `${SIZE}px`,
              position: "absolute",
              background: "white/5",
              borderRadius: 3,
              cornerShape: "superellipse",
            },
            center
              ? {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }
              : {
                display: "grid",
                gridTemplateColumns: "1fr",
                gridTemplateRows: "1fr",
              },
          ),
          className,
        ]}
      >
        {children}
      </Box>
    </Box>
  );
};
