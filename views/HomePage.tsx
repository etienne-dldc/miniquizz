import { Paper, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";

type HomePageProps = {};

export const HomePage: FC<HomePageProps> = (
  {},
) => {
  return (
    <Layout title="Apps">
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
      >
        <Typography textSize="2xl" fontWeight="bold" render="h2">
          TODO
        </Typography>
      </Paper>
    </Layout>
  );
};
