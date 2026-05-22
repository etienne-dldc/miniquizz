import { Box, type ClassListProp, css, flattenClassList } from "@dldc/hono-ui";
import type { Child } from "hono/jsx";

interface RatioScreenProps {
  ratio: number;
  children: Child;
  classList?: ClassListProp;
}

const SIZE = 400;

export const RatioScreen = (
  { ratio, children, classList }: RatioScreenProps,
) => {
  return (
    <Box data-autofit classList={css({ overflow: "hidden", position: "relative" })}>
      <Box
        classList={[
          css(
            {
              width: `${ratio * SIZE}px`,
              height: `${SIZE}px`,
              position: "absolute",
              borderRadius: 3,
              cornerShape: "superellipse",
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "1fr",
            },
          ),
          ...flattenClassList(classList),
        ]}
      >
        {children}
      </Box>
    </Box>
  );
};
