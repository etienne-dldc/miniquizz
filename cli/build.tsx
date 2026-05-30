import { Box, css } from "@dldc/hono-ui";
import { Fragment } from "@hono/hono/jsx";
import { HtmlEscapedCallbackPhase, resolveCallback } from "@hono/hono/utils/html";
import { parseArgs } from "@std/cli/parse-args";
import { copy } from "@std/fs";
import { resolve } from "@std/path";
import { BlockDisplay } from "../components/BlockDisplay.tsx";
import { FullscreenButton } from "../components/FullscreenButton.tsx";
import { Layout } from "../components/Layout.tsx";
import { RatioScreen } from "../components/RatioScreen.tsx";
import { SlidesProvider } from "../contexts/slides.tsx";
import { ensureDataFolder } from "../logic/ensureDataFolder.ts";
import { parseDoc } from "../logic/parseDoc.ts";
import { computeAllProgress } from "../logic/progress.ts";

export async function build() {
  const args = parseArgs(Deno.args, {
    alias: {
      output: "o",
      help: "h",
    },
    boolean: ["help"],
    string: ["output"],
    default: {
      output: "dist",
    },
  });

  if (args.help) {
    console.log([
      "Usage: miniquizz build <data-path-base> [options]",
      "",
      "Options:",
      "  -o, --output <path>  Output directory (default: dist)",
      "  -h, --help           Show this help message",
    ].join("\n"));
  }

  const [_subcommand, dataPathBase] = args._;
  const outputPath = resolve(args.output);

  if (!dataPathBase || typeof dataPathBase !== "string") {
    throw new Error("Data path base is required");
  }
  const dataPath = resolve(dataPathBase);
  await ensureDataFolder(dataPath);
  const docFilePath = resolve(dataPath, "data.doc.tsx");
  const doc = await parseDoc(docFilePath);
  const allProgress = computeAllProgress(doc, "build").filter((progress) => progress.type !== "leaderboard");

  const element = (
    <Layout
      title={doc.name}
      classList={css({ display: "grid", gridTemplateRows: "1fr" })}
      showLogoutButton={false}
      headerLeftContent={<FullscreenButton />}
      buildMode={{ progressCount: allProgress.length }}
    >
      <Box classList={css({ display: "grid", gridTemplateRows: "1fr" })}>
        <RatioScreen ratio={doc.ratio} classList={css({ padding: 5, overflow: "hidden" })}>
          <div data-slide-placeholder />
        </RatioScreen>
      </Box>
    </Layout>
  );

  const mainPageContent = await resolveCallback(element, HtmlEscapedCallbackPhase.Stringify, false, {});

  const indexPath = resolve(outputPath, "index.html");
  await Deno.mkdir(outputPath, { recursive: true });
  await Deno.writeTextFile(indexPath, mainPageContent);

  // Copy public to dist/public
  const publicPath = resolve("public");
  const outputPublicPath = resolve(outputPath, "public");
  await copy(publicPath, outputPublicPath, { overwrite: true });

  // Copy dataPath/public to dist/data (if it exists)
  const dataPublicPath = resolve(dataPath, "public");
  const dataOutputPublicPath = resolve(outputPath, "data");
  try {
    await Deno.stat(dataPublicPath);
    await copy(dataPublicPath, dataOutputPublicPath, { overwrite: true });
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      // Ignore if data/public does not exist
    } else {
      throw e;
    }
  }

  const outputFragmentsPath = resolve(outputPath, "fragments");
  await Deno.mkdir(outputFragmentsPath, { recursive: true });

  // Render each steps
  await Promise.all(allProgress.map(async (progress, index) => {
    const element = (
      <SlidesProvider value={{ progress, sessionState: null }}>
        <Fragment>
          {progress.step.blocks.map((block, index) => <BlockDisplay key={index} block={block} />)}
        </Fragment>
      </SlidesProvider>
    );
    const content = await resolveCallback(element, HtmlEscapedCallbackPhase.Stringify, false, {});
    const stepPath = resolve(outputFragmentsPath, `step-${index.toString().padStart(2, "0")}.html`);
    await Deno.writeTextFile(stepPath, content);
  }));

  console.log(`Build completed successfully. Output directory: ${outputPath}`);
}
