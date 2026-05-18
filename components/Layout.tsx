import { Box, css, Html, Title } from "@dldc/hono-ui";
import { type Child, type FC, Fragment } from "hono/jsx";

type LayoutProps = {
  title: string;
  children: Child;
  class?: string | Promise<string>;
};

export const Layout: FC<LayoutProps> = (
  { title, children, class: className },
) => {
  return (
    <Html
      title={title}
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
      <Box class={css({ gap: 4, padding: 4, display: "grid", position: "absolute", inset: 0, gridTemplateRows: "auto 1fr" })}>
        <Title href="/" class={css({ textAlign: "center" })}>
          {title}
        </Title>
        <Box class={[className]}>
          {children}
        </Box>
      </Box>
    </Html>
  );
};
