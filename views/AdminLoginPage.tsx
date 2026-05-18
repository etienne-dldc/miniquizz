import { Button, css, FormField, htmlx, Input, Paper, Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";

type AdminLoginPageProps = {
  title: string;
  invalidPassword?: boolean;
};

export const AdminLoginPage: FC<AdminLoginPageProps> = (
  { invalidPassword, title },
) => {
  return (
    <Layout title={title} class={css({ display: "grid", placeItems: "center" })}>
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
        class={css({ minWidth: "[min(100vw - 2rem, 30rem)]" })}
      >
        <Typography fontSize="2xl" fontWeight="bold" render="h2">
          Admin access
        </Typography>
        <htmlx.form method="post" action="/admin">
          <Stack flexDirection="column" gap={4} alignItems="stretch">
            <FormField
              id="admin-password"
              label="Password"
              // name="password"
              error={invalidPassword ? "Invalid password" : undefined}
            >
              <Input
                id="admin-password"
                type="password"
                name="password"
                required
                style={{ width: "100%" }}
                placeholder="Enter admin password"
              />
            </FormField>
            <Button type="submit" variant="primary">
              Login as admin
            </Button>
          </Stack>
        </htmlx.form>
      </Paper>
    </Layout>
  );
};
