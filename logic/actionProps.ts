import type { AdminAction } from "./adminActionSchema.ts";
import type { UserAction } from "./userActionSchema.ts";

export type Shortcut =
  | "Space"
  | "Enter"
  | "ArrowRight"
  | "ArrowLeft"
  | "ArrowUp"
  | "ArrowDown";

export function adminActionProps(action: AdminAction, shortcut?: Shortcut) {
  return actionProps("/admin/action", action, shortcut);
}

export function userActionProps(action: UserAction) {
  return actionProps("/action", action);
}

function actionProps(
  action: string,
  vals: unknown,
  shortcut?:
    | "Space"
    | "Enter"
    | "ArrowRight"
    | "ArrowLeft"
    | "ArrowUp"
    | "ArrowDown",
) {
  return {
    "hx-post": action,
    "hx-vals": JSON.stringify(vals),
    "hx-swap": "none",
    ...(shortcut ? { "hx-trigger": `click, keyup[code=='${shortcut}'] from:body` } : {}),
  };
}
