import { Button, FormField, htmlx, Input, Paper, Stack } from "@dldc/hono-ui";
import { Layout } from "../components/Layout.tsx";

export const LoginPage = () => {
  return (
    <Layout title="Login">
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
      >
        <htmlx.form method="post" action="/login">
          <Stack direction="column" gap={4} align="stretch">
            <FormField id="login-name" label="Name" name="name">
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
