import { Box, css } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";
import { UserQuizz } from "../components/UserQuizz.tsx";
import type { QuizzStore } from "../logic/quizzStore.ts";
import type { Session } from "../logic/sessions.ts";

type HomePageProps = {
  session: Session;
  store: QuizzStore;
};

export const HomePage: FC<HomePageProps> = ({ session, store }) => {
  const quizz = store.getQuizz();
  return (
    <Layout title={quizz.name} classList={css({ display: "grid", gridTemplateRows: "1fr" })} showLogoutButton>
      <Box hx-sse:connect="/stream" classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
        <UserQuizz session={session} store={store} />
      </Box>
    </Layout>
  );
};
