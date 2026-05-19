import { Box, Button, css, Icon, InlineGroup, Input, SrOnly } from "@dldc/hono-ui";
import { ArrowRight } from "lucide-static";
import { Layout } from "../components/Layout.tsx";

interface LoginPageProps {
  title: string;
}

export const LoginPage = ({ title }: LoginPageProps) => {
  return (
    <Layout title={title} classList={css({ display: "grid", placeItems: "center" })} showLogoutButton={false}>
      <Box classList={css({ minWidth: "[min(100vw - 2rem, 30rem)]" })}>
        <form method="post" action="/login">
          <InlineGroup classList={css({ display: "grid", gridTemplateColumns: "1fr auto" })}>
            <Input
              id="login-name"
              name="name"
              required
              size={14}
              style={{ width: "100%" }}
              placeholder="Paul Bocuse"
            />
            <Button type="submit" variant="primary" size={14}>
              <Icon icon={ArrowRight} />
              <SrOnly>Se connecter</SrOnly>
            </Button>
          </InlineGroup>
        </form>
      </Box>
    </Layout>
  );
};
