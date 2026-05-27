import { Box, css } from "@dldc/hono-ui";
import { type FC, Fragment } from "@hono/hono/jsx";
import { AdminLiveQuizz } from "../components/AdminLiveQuizz.tsx";
import { AdminMenu } from "../components/AdminMenu.tsx";
import { FullscreenButton } from "../components/FullscreenButton.tsx";
import { Layout } from "../components/Layout.tsx";
import { Status } from "../components/Status.tsx";
import { SessionProvider } from "../contexts/session.tsx";
import { StoreProvider } from "../contexts/store.tsx";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";

type AdminPageProps = {
  store: AppStore;
  session: Session;
};

export const AdminPage: FC<AdminPageProps> = ({ store, session }) => {
  const doc = store.getDoc();
  return (
    <SessionProvider session={session}>
      <StoreProvider store={store}>
        <Layout
          title={doc.name}
          classList={css({ display: "grid", gridTemplateRows: "1fr auto", gap: 4 })}
          showLogoutButton
          headerLeftContent={
            <Fragment>
              <AdminMenu />
              <FullscreenButton />
            </Fragment>
          }
        >
          <Box
            hx-sse:connect="/admin/stream/quizz"
            hx-swap="innerHTML transition:true"
            classList={css({ display: "grid", gridTemplateRows: "1fr" })}
          >
            <AdminLiveQuizz store={store} session={session} />
          </Box>
          <Box hx-sse:connect="/admin/stream/status" classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
            <Status store={store} />
          </Box>
        </Layout>
      </StoreProvider>
    </SessionProvider>
  );
};
