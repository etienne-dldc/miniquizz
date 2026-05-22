import { Button, css, Icon, InlineGroup, Input, SrOnly, Stack, Typography } from "@dldc/hono-ui";
import type { FC } from "@hono/hono/jsx";
import { ArrowRight } from "lucide-static";
import { Layout } from "../components/Layout.tsx";

type AdminLoginPageProps = {
  title: string;
  invalidPassword?: boolean;
};

export const AdminLoginPage: FC<AdminLoginPageProps> = (
  { invalidPassword, title },
) => {
  return (
    <Layout title={title} classList={css({ display: "grid", placeItems: "center" })} showLogoutButton={false}>
      <Stack
        flexDirection="column"
        gap={2}
        classList={css({ minWidth: "[min(100vw - 2rem, 30rem)]" })}
        render={<form method="post" action="/admin" />}
      >
        <Typography fontSize="2xl" fontWeight="bold" render="h2">
          Admin access
        </Typography>
        <InlineGroup classList={css({ display: "grid", gridTemplateColumns: "1fr auto" })}>
          <Input
            id="admin-password"
            type="password"
            name="password"
            required
            style={{ width: "100%" }}
            placeholder="Enter admin password"
            size={14}
          />
          <Button type="submit" variant="primary" size={14}>
            <Icon icon={ArrowRight} />
            <SrOnly>Se connecter</SrOnly>
          </Button>
        </InlineGroup>
        {invalidPassword && (
          <Typography color="red-500" fontSize="base">
            The password you entered is incorrect. Please try again.
          </Typography>
        )}
      </Stack>
    </Layout>
  );
};
