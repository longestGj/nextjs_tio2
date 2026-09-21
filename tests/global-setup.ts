import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, join, relative } from "node:path";

const root = join(process.cwd(), "out");
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function fileFor(pathname: string) {
  const decoded = decodeURIComponent(pathname);
  const candidate = join(root, decoded.replace(/^\/+/, ""), decoded.endsWith("/") ? "index.html" : "");
  const traversal = relative(root, candidate);
  if (traversal.startsWith("..") || isAbsolute(traversal)) return null;
  try {
    if ((await stat(candidate)).isFile()) return candidate;
  } catch {}
  return null;
}

export default async function globalSetup() {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1:8333").pathname;
    const requestedFile = await fileFor(pathname);
    const file = requestedFile ?? join(root, "404.html");
    try {
      const body = await readFile(file);
      response.writeHead(requestedFile ? 200 : 404, {
        "content-type": contentTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(8333, "127.0.0.1", resolve);
  });

  return async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  };
}
