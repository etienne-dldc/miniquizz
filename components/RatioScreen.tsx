import { Box, type ClassListProp, css, flattenClassList } from "@dldc/hono-ui";
import type { Child } from "hono/jsx";

interface RatioScreenProps {
  ratio: number;
  children: Child;
  center?: boolean;
  classList?: ClassListProp;
}

const SIZE = 400;

export const RatioScreen = (
  { ratio, children, center, classList }: RatioScreenProps,
) => {
  return (
    <Box data-autofit classList={css({ overflow: "hidden" })}>
      <Box
        classList={[
          css(
            {
              width: `${ratio * SIZE}px`,
              height: `${SIZE}px`,
              position: "absolute",
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
          ...flattenClassList(classList),
        ]}
      >
        {children}
      </Box>
    </Box>
  );
};
