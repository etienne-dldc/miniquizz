import { Box, css } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";
import { UserLive } from "../components/UserLive.tsx";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";

type HomePageProps = {
  session: Session;
  store: AppStore;
};

export const HomePage: FC<HomePageProps> = ({ session, store }) => {
  const doc = store.getDoc();
  return (
    <Layout title={doc.name} classList={css({ display: "grid", gridTemplateRows: "1fr" })} showLogoutButton>
      <Box hx-sse:connect="/stream" classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
        <UserLive session={session} store={store} />
      </Box>
    </Layout>
  );
};
