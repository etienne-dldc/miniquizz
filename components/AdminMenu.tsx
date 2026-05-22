import { Button, css, Icon, Paper, SrOnly } from "@dldc/hono-ui";
import type { FC } from "@hono/hono/jsx";
import { ArrowLeft, ArrowRight, ListRestart, Menu, RotateCcw } from "lucide-static";
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
        <SrOnly>Menu administrateur</SrOnly>
      </Button>

      <div id="admin-menu" popover="auto" class={popoverStyle}>
        <Paper flexDirection="column" gap={2} padding={4} classList={css({ minWidth: 100, borderRadius: 6 })}>
          <Button {...adminActionProps({ type: "Reset" })} hx-confirm="Reinitialiser le quiz ? Cette action est irreversible.">
            <Icon icon={ListRestart} />
            Reinitialiser le quiz
          </Button>
          <Button {...adminActionProps({ type: "Prev" }, "ArrowLeft")}>
            <Icon icon={ArrowLeft} />
            Precedent
          </Button>
          <Button {...adminActionProps({ type: "Next" }, "ArrowRight")}>
            <Icon icon={ArrowRight} />
            Suivant
          </Button>
          <Button {...adminActionProps({ type: "ResetStep" })} hx-confirm="Reinitialiser la question ?">
            <Icon icon={RotateCcw} />
            Reinitialiser la question
          </Button>
        </Paper>
      </div>
    </>
  );
};
