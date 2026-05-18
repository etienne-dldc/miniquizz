import { css, Paper } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { AdminQuizz } from "../components/AdminQuizz.tsx";
import { Layout } from "../components/Layout.tsx";
import { LogoutButton } from "../components/LogoutButton.tsx";
import type { QuizzState } from "../logic/quizzStore.ts";
import type { Session } from "../logic/sessions.ts";

type AdminPageProps = {
  state: QuizzState;
  session: Session;
};

export const AdminPage: FC<AdminPageProps> = ({ state, session }) => {
  return (
    <Layout title={state.quizz.name} class={css({ display: "grid", gridTemplateRows: "1fr auto", gap: 4 })}>
      <Paper hx-sse:connect="/admin/stream" class={css({ display: "grid", gridTemplateRows: "1fr", padding: 4 })}>
        <AdminQuizz state={state} session={session} />
      </Paper>
      <LogoutButton />
    </Layout>
  );
};
