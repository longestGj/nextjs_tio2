import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

function escapeRoute(value) {
  return value.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
}

function directoryIndexRoute(file, override) {
  if (!override?.path || !file.endsWith("index.html")) return null;
  if (file === "404/index.html" || file.startsWith("_not-found/")) return null;

  const directory = file === "index.html" ? "" : file.slice(0, -"index.html".length);
  const pathname = `/${directory}`;
  return {
    src: `^${escapeRoute(pathname)}$`,
    dest: `/${override.path.replace(/^\/+/, "")}`,
  };
}

export async function prepareVercelOutput(outputDirectory = ".vercel/output") {
  const configPath = join(outputDirectory, "config.json");
  const staticDirectory = join(outputDirectory, "static");
  const config = JSON.parse(await readFile(configPath, "utf8"));

  if (!Array.isArray(config.routes)) {
    throw new Error("Vercel output config does not contain a routes array");
  }
  const filesystemIndex = config.routes.findIndex(
    (route) => route.handle === "filesystem",
  );
  if (filesystemIndex < 0) {
    throw new Error("Vercel output config does not contain a filesystem handler");
  }

  const generated = [];
  for (const [file, override] of Object.entries(config.overrides ?? {})) {
    const route = directoryIndexRoute(file, override);
    if (!route) continue;
    await access(join(staticDirectory, ...file.split("/")));
    generated.push(route);
  }
  generated.sort((left, right) => left.src.localeCompare(right.src));

  const missing = generated.filter((route) => {
    const sameSource = config.routes.find((existing) => existing.src === route.src);
    if (sameSource && sameSource.dest !== route.dest) {
      throw new Error(`Vercel output route ${route.src} already has a different destination`);
    }
    return !sameSource;
  });

  if (missing.length > 0) {
    config.routes.splice(filesystemIndex, 0, ...missing);
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  }

  return { routes: generated.length };
}

const invokedAsScript =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedAsScript) {
  try {
    const result = await prepareVercelOutput(process.argv[2]);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
