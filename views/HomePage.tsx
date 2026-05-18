import { Paper, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";
import { LogoutButton } from "../components/LogoutButton.tsx";
import { UserQuizz } from "../components/UserQuizz.tsx";
import type { QuizzState } from "../logic/quizzStore.ts";
import type { Session } from "../logic/sessions.ts";

type HomePageProps = {
  session: Session;
  state: QuizzState;
};

export const HomePage: FC<HomePageProps> = ({ session, state }) => {
  return (
    <Layout title="Apps">
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
      >
        <Typography fontSize="2xl" fontWeight="bold" render="h2">
          TODO {session.name}
        </Typography>
        <div hx-sse:connect="/stream">
          <UserQuizz sessionId={session.id} state={state} />
        </div>
      </Paper>
      <LogoutButton />
    </Layout>
  );
};
