import { Link, Paper, Typography } from "@dldc/hono-ui";
import { Layout } from "../components/Layout.tsx";
import type { Session } from "../logic/sessions.ts";

interface NotFoundPageProps {
  session: Session | null;
}

export const NotFoundPage = ({ session }: NotFoundPageProps) => {
  return (
    <Layout title="Page introuvable" showLogoutButton={!!session}>
      <Paper flexDirection="column" gap={2} padding={3}>
        <Typography fontSize="3xl" color="white" fontWeight="bold">404</Typography>
        <Typography fontSize="xl" color="gray-200">
          Page introuvable.
        </Typography>
        <Link href="/">Retour a l'accueil</Link>
      </Paper>
    </Layout>
  );
};
