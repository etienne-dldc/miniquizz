import { css, Link, Paper, Typography } from "@dldc/hono-ui";
import type { FC } from "@hono/hono/jsx";
import { Layout } from "../components/Layout.tsx";
import type { Session } from "../logic/sessions.ts";

type ErrorPageProps = {
  title?: string;
  message: string;
  returnPath?: string;
  returnLabel?: string;
  session: Session | null;
};

const linkClass = css({
  color: "blue-400",
  textDecoration: "none",
  transition: "opacity 140ms ease",
  selectors: {
    "&:hover": {
      opacity: 0.8,
    },
  },
});

export const ErrorPage: FC<ErrorPageProps> = ({
  title = "Error",
  message,
  returnPath = "/",
  returnLabel = "Back",
  session,
}) => {
  return (
    <Layout title={title} showLogoutButton={!!session}>
      <Link href={returnPath}>
        <span class={linkClass}>← {returnLabel}</span>
      </Link>
      <Paper flexDirection="column" gap={3} padding={2}>
        <Typography fontSize="lg" color="gray-200">
          {message}
        </Typography>
      </Paper>
    </Layout>
  );
};
