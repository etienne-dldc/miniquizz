import { Box, css } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { AdminMenu } from "../components/AdminMenu.tsx";
import { AdminQuizz } from "../components/AdminQuizz.tsx";
import { Layout } from "../components/Layout.tsx";
import type { QuizzState } from "../logic/quizzStore.ts";
import type { Session } from "../logic/sessions.ts";

type AdminPageProps = {
  state: QuizzState;
  session: Session;
};

export const AdminPage: FC<AdminPageProps> = ({ state, session }) => {
  return (
    <Layout
      title={state.quizz.name}
      classList={css({ display: "grid", gridTemplateRows: "1fr" })}
      showLogoutButton
      headerLeftContent={<AdminMenu />}
    >
      <Box hx-sse:connect="/admin/stream" classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
        <AdminQuizz state={state} session={session} />
      </Box>
    </Layout>
  );
};
