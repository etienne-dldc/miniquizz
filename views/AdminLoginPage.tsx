import { Button, FormField, htmlx, Input, Paper, Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.tsx";

type AdminLoginPageProps = {
  invalidPassword?: boolean;
};

export const AdminLoginPage: FC<AdminLoginPageProps> = (
  { invalidPassword },
) => {
  return (
    <Layout title="Admin Login">
      <Paper
        gap={4}
        flexDirection="column"
        padding={4}
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
