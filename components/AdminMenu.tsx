import { Button, css, Icon, Paper, SrOnly } from "@dldc/hono-ui";
import type { FC } from "hono/jsx";
import { Menu } from "lucide-static";
import { adminActionProps } from "../logic/actionProps.ts";

const popoverStyle = css({
  margin: 0,
  inset: "auto",
  marginTop: "[0.4rem]",
  insetBlockStart: "[anchor(bottom)]",
  insetInlineStart: "[anchor(left)]",
  background: "transparent",
});

export const AdminMenu: FC = () => {
  return (
    <>
      <Button
        popovertarget="admin-menu"
        variant="ghost"
        size={12}
        classList={css({
          selectors: {
            "&:has(+ :popover-open)": {
              background: "white/10",
            },
          },
        })}
      >
        <Icon icon={Menu} />
        <SrOnly>Admin Menu</SrOnly>
      </Button>

      <div id="admin-menu" popover="auto" class={popoverStyle}>
        <Paper flexDirection="column" gap={2} padding={3} classList={css({ minWidth: 100 })}>
          <Button {...adminActionProps({ type: "Reset" })} hx-confirm="Reset the quiz? This action cannot be undone.">
            Reset Quiz
          </Button>
          <Button {...adminActionProps({ type: "Prev" }, "ArrowLeft")}>
            Prev
          </Button>
          <Button {...adminActionProps({ type: "Next" }, "ArrowRight")}>
            Next
          </Button>
        </Paper>
      </div>
    </>
  );
};
