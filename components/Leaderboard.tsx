import { Box, css, Icon, Stack, Typography } from "@dldc/hono-ui";
import { CircleCheckBig, CircleDashed, CircleStar, CircleX } from "lucide-static";
import type { Session } from "../logic/sessions.ts";
import type { AppStore } from "../logic/store.ts";

interface LeaderboardProps {
  store: AppStore;
  session: Session;
}

const wrapperClassName = css({
  display: "grid",
  gap: 2,
  gridTemplateColumns: "1fr",
  gridTemplateRows: "auto 1fr",
  overflow: "hidden",
  alignItems: "start",
});

const listClassName = css({
  display: "grid",
  overflowY: "auto",
  gridTemplateColumns: "auto 1fr auto auto auto",
  rowGap: 1,
  columnGap: 3,
  alignItems: "end",
  paddingInline: 2,
  maxHeight: "full",
});

const rowClassName = css({
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "subgrid",
  paddingInline: 2,
  borderRadius: "full",
  cornerShape: "superellipse",
  selectors: {
    "&:nth-child(odd)": { background: "neutral-100/5" },
  },
});

export function Leaderboard({ store, session }: LeaderboardProps) {
  const leaderboard = store.getLeaderboard();
  return (
    <Box classList={wrapperClassName}>
      <Typography fontSize="2xl" fontWeight="bold" classList={css({ textAlign: "center" })}>Classement</Typography>
      <Box classList={listClassName}>
        {leaderboard.length === 0 && (
          <Typography fontSize="lg" classList={css({ textAlign: "center", color: "neutral-400", gridColumn: "1 / -1" })}>
            Aucun participant pour le moment...
          </Typography>
        )}
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.sessionId === session.id;
          return (
            <Box key={entry.sessionId} classList={rowClassName}>
              <Stack alignItems="center" justifyContent="space-between" gap={1} classList={css({ paddingInline: 1 })}>
                {index === 0 && <Icon icon={CircleStar} size={6} classList={css({ color: "yellow-300" })} />}
                {index === 1 && <Icon icon={CircleStar} size={6} classList={css({ color: "gray-300" })} />}
                {index === 2 && <Icon icon={CircleStar} size={6} classList={css({ color: "orange-300" })} />}
                <Typography
                  fontSize="sm"
                  classList={css({ color: "neutral-400", fontFamily: "mono", width: "full", textAlign: "right" })}
                >
                  {index + 1}
                </Typography>
              </Stack>
              <Stack
                classList={css({
                  width: "full",
                  background: isCurrentUser ? "blue-600" : undefined,
                  paddingInline: 2,
                  paddingBlock: 0.5,
                  borderRadius: "full",
                  cornerShape: "superellipse",
                })}
              >
                <Typography fontWeight="bold">{entry.name}</Typography>
              </Stack>
              <Stack
                gap={1}
                alignItems="center"
                justifyContent="flex-end"
                classList={css({ color: "green-400", fontFamily: "mono", fontSize: "xs" })}
              >
                <Typography>{entry.results.correct}</Typography>
                <Icon icon={CircleCheckBig} size={3.5} />
              </Stack>
              <Stack
                gap={1}
                alignItems="center"
                justifyContent="flex-end"
                classList={css({ color: "blue-400", fontFamily: "mono", fontSize: "xs" })}
              >
                <Typography>{entry.results.skipped}</Typography>
                <Icon icon={CircleDashed} size={3.5} />
              </Stack>
              <Stack
                gap={1}
                alignItems="center"
                justifyContent="flex-end"
                classList={css({ color: "red-400", fontFamily: "mono", fontSize: "xs" })}
              >
                <Typography>{entry.results.wrong}</Typography>
                <Icon icon={CircleX} size={3.5} />
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
