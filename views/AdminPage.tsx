import { Paper, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";
import { LogoutButton } from "../components/LogoutButton.tsx";
import type { Session } from "../logic/sessions.ts";

type AdminPageProps = {
  session: Session;
};

export const AdminPage: FC<AdminPageProps> = ({ session }) => {
  return (
    <Layout title="Admin">
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
      >
        <Typography textSize="2xl" fontWeight="bold" render="h2">
          Admin page placeholder
        </Typography>
        <Typography>
          Connected as {session.name}
        </Typography>
      </Paper>
      <LogoutButton />
    </Layout>
  );
};
