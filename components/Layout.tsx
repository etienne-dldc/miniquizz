import { Box, type ClassListProp, css, Html, Stack, Title } from "@dldc/hono-ui";
import { type Child, type FC, Fragment } from "hono/jsx";
import { LogoutButton } from "./LogoutButton.tsx";

type LayoutProps = {
  title: string;
  children: Child;
  classList?: ClassListProp;
  showLogoutButton: boolean;
  headerLeftContent?: Child;
};

export const Layout: FC<LayoutProps> = (
  { title, children, classList, showLogoutButton, headerLeftContent },
) => {
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
          <script src="/public/libs/htmx.4.0.0-beta-3.min.js" />
          <script src="/public/libs/hx-sse.4.0.0-beta-3.min.js" />
          <script src="/public/utils/cleanup-css.js" />
          <script src="/public/utils/autofit.js" />
        </Fragment>
      }
    >
      <Box classList={css({ gap: 4, padding: 4, display: "grid", position: "absolute", inset: 0, gridTemplateRows: "auto 1fr" })}>
        <Box classList={css({ display: "grid", gridTemplateColumns: "1fr auto 1fr" })}>
          <Stack flexDirection="row" justifyContent="flex-start" alignItems="center">
            {headerLeftContent}
          </Stack>
          <Title href="/" classList={css({ textAlign: "center" })}>
            {title}
          </Title>
          <Stack flexDirection="row" justifyContent="flex-end" alignItems="center">
            {showLogoutButton && <LogoutButton />}
          </Stack>
        </Box>
        <Box classList={classList}>
          {children}
        </Box>
      </Box>
    </Html>
  );
};
