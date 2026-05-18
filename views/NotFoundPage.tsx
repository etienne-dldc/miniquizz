import { Link, Paper, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";

export const NotFoundPage: FC = () => {
  return (
    <Layout title="Page not found">
      <Paper flexDirection="column" gap={2} padding={3}>
        <Typography fontSize="3xl" color="white" fontWeight="bold">404</Typography>
        <Typography fontSize="xl" color="gray-200">
          Page not found.
        </Typography>
        <Link href="/">Go back to home</Link>
      </Paper>
    </Layout>
  );
};
