import { Box, Button, css, Icon, SrOnly } from "@dldc/hono-ui";
import { Fullscreen } from "lucide-static";
import { Layout } from "../components/Layout.tsx";
import { UserLive } from "../components/UserLive.tsx";
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
          headerLeftContent={
            <Button
              variant="ghost"
              size={12}
              data-fullscreen
              data-fullscreen-orientation="landscape"
            >
              <Icon icon={Fullscreen} />
              <SrOnly>Fullscreen</SrOnly>
            </Button>
          }
        >
          <Box hx-sse:connect="/stream" classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
            <UserLive session={session} store={store} />
          </Box>
        </Layout>
      </StoreProvider>
    </SessionProvider>
  );
};
