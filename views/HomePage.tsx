import { Box, css } from "@dldc/hono-ui";
import { FullscreenButton } from "../components/FullscreenButton.tsx";
import { Layout } from "../components/Layout.tsx";
import { UserLiveQuizz } from "../components/UserLiveQuizz.tsx";
import { SessionProvider } from "../contexts/session.tsx";
import { StoreProvider } from "../contexts/store.tsx";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";

type HomePageProps = {
  session: Session;
  store: AppStore;
};

export const HomePage = ({ session, store }: HomePageProps) => {
  const doc = store.getDoc();
  return (
    <SessionProvider session={session}>
      <StoreProvider store={store}>
        <Layout
          title={doc.name}
          classList={css({ display: "grid", gridTemplateRows: "1fr" })}
          showLogoutButton
          headerLeftContent={<FullscreenButton />}
        >
          <Box hx-sse:connect="/stream" classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
            <UserLiveQuizz session={session} store={store} />
          </Box>
        </Layout>
      </StoreProvider>
    </SessionProvider>
  );
};
