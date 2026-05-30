import { Box, type ClassListProp, css, Html, Stack, Title } from "@dldc/hono-ui";
import { type Child, Fragment } from "@hono/hono/jsx";
import { LogoutButton } from "./LogoutButton.tsx";

type LayoutProps = {
  title: string;
  children: Child;
  classList?: ClassListProp;
  showLogoutButton: boolean;
  headerLeftContent?: Child;
  buildMode?: false | { progressCount: number };
};

export const Layout = (
  { title, children, classList, showLogoutButton, headerLeftContent, buildMode }: LayoutProps,
) => {
  const liveMode = !buildMode;

  return (
    <Html
      title={title}
      classList={css({ backgroundColor: "neutral-800" })}
      heads={
        <Fragment>
          <link
            rel="icon"
            href={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">❓</text></svg>`}
          />
          {liveMode && <script src="/public/libs/htmx.4.0.0-beta-3.min.js" />}
          {liveMode && <script src="/public/libs/hx-sse.4.0.0-beta-3.min.js" />}
          <script src="/public/utils/cleanup-css.js" />
          <script src="/public/utils/autofit.js" />
          <script src="/public/utils/fullscreen.js" />
          {buildMode && <script src="/public/utils/build-play.js" />}
          {buildMode && <script>{"globalThis.__PROGRESS_COUNT__ = " + buildMode.progressCount}</script>}
          <style>
            {`
              @keyframes slide-fade-in {
                from { opacity: 0; }
              }
              @keyframes slide-fade-out {
                to { opacity: 0; }
              }
              ::view-transition-old(slide) {
                animation: 200ms ease both slide-fade-out;
              }
              ::view-transition-new(slide) {
                animation: 200ms ease both slide-fade-in;
              }
            `}
          </style>
        </Fragment>
      }
    >
      <Box
        classList={css({
          gap: 4,
          padding: 4,
          display: "grid",
          position: "absolute",
          inset: 0,
          gridTemplateRows: "auto 1fr",
          media: {
            "@media (max-width: 1000px)": {
              padding: 2,
              gap: 2,
            },
          },
        })}
      >
        <Box
          classList={css({
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            media: {
              "@media (max-width: 1000px)": {
                marginBottom: -2,
                marginTop: -2,
              },
            },
          })}
        >
          <Stack flexDirection="row" justifyContent="flex-start" alignItems="center">
            {headerLeftContent}
          </Stack>
          <Stack flexDirection="row" justifyContent="center" alignItems="center">
            <Title href="/" classList={css({ textAlign: "center", media: { "@media (max-width: 1000px)": { fontSize: "lg" } } })}>
              {title}
            </Title>
          </Stack>
          <Stack flexDirection="row" justifyContent="flex-end" alignItems="center">
            {liveMode && showLogoutButton && <LogoutButton />}
          </Stack>
        </Box>
        <Box classList={classList}>
          {children}
        </Box>
      </Box>
    </Html>
  );
};
