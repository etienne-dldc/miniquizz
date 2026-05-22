import { Box, css } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { AdminLive } from "../components/AdminLive.tsx";
import { AdminMenu } from "../components/AdminMenu.tsx";
import { Layout } from "../components/Layout.tsx";
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
          classList={css({ display: "grid", gridTemplateRows: "1fr" })}
          showLogoutButton
          headerLeftContent={<AdminMenu />}
        >
          <Box hx-sse:connect="/admin/stream" classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
            <AdminLive store={store} session={session} />
          </Box>
        </Layout>
      </StoreProvider>
    </SessionProvider>
  );
};
