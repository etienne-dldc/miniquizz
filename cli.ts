import { parseArgs } from "@std/cli/parse-args";
import { build } from "./cli/build.tsx";

const args = parseArgs(Deno.args);

const subCommand = args._[0];

if (subCommand === "build") {
  await build();
  Deno.exit(0);
}

throw new Error(`Unknown subcommand: ${subCommand}`);
