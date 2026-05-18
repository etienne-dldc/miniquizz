import { Button, css, FormField, htmlx, Input, Paper, Stack } from "@dldc/hono-ui";
import { Layout } from "../components/Layout.tsx";

interface LoginPageProps {
  title: string;
}

export const LoginPage = ({ title }: LoginPageProps) => {
  return (
    <Layout title={title} class={css({ display: "grid", placeItems: "center" })}>
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
        class={css({ minWidth: "[min(100vw - 2rem, 30rem)]" })}
      >
        <htmlx.form method="post" action="/login">
          <Stack flexDirection="column" gap={4} alignItems="stretch">
            <FormField id="login-name" label="Name">
              <Input
                id="login-name"
                name="name"
                required
                size={10}
                style={{ width: "100%" }}
                placeholder="Paul Bocuse"
              />
            </FormField>
            <Button type="submit" variant="primary">
              Login
            </Button>
          </Stack>
        </htmlx.form>
      </Paper>
    </Layout>
  );
};
