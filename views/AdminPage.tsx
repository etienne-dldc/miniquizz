import { Paper } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { AdminQuizz } from "../components/AdminQuizz.tsx";
import { Layout } from "../components/Layout.tsx";
import { LogoutButton } from "../components/LogoutButton.tsx";
import type { QuizzState } from "../logic/quizzReducer.ts";

type AdminPageProps = {
  state: QuizzState;
};

export const AdminPage: FC<AdminPageProps> = ({ state }) => {
  return (
    <Layout title="Admin">
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
      >
        <div hx-sse:connect="/admin/stream">
          <AdminQuizz state={state} />
        </div>
      </Paper>
      <LogoutButton />
    </Layout>
  );
};
