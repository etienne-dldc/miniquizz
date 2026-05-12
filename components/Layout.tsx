import { Html, Title, UniversalLayout, utility } from "@dldc/hono-ui";
import { css } from "hono/css";
import { type FC, Fragment } from "hono/jsx";

type LayoutProps = {
  title?: string;
  children: unknown;
};

export const Layout: FC<LayoutProps> = (
  { title, children },
) => {
  return (
    <Html
      title={title ? `${title} - Miniquizz` : "Miniquizz"}
      heads={
        <Fragment>
          <link
            rel="icon"
            href={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">❓</text></svg>`}
          />
          <script src="/public/libs/htmx.4.0.0-beta-3.min.js" />
          <script src="/public/libs/hx-sse.4.0.0-beta-3.min.js" />
        </Fragment>
      }
    >
      <UniversalLayout
        class={css`
          ${utility.rowGap(4)};
        `}
      >
        <Title href="/">
          Miniquizz
        </Title>
        {children}
      </UniversalLayout>
    </Html>
  );
};
