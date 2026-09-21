import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import { prepareVercelOutput } from "../scripts/prepare-vercel-output.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function fixture({ includeFilesystemHandle = true } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "tio2-vercel-output-"));
  temporaryDirectories.push(directory);

  await Promise.all([
    mkdir(join(directory, "static", "applications"), { recursive: true }),
    mkdir(join(directory, "static", "applications", "titanium-dioxide-for-coatings"), { recursive: true }),
    mkdir(join(directory, "static", "applications", "titanium-dioxide-for-plastics"), { recursive: true }),
    mkdir(join(directory, "static", "applications", "titanium-dioxide-for-masterbatch"), { recursive: true }),
    mkdir(join(directory, "static", "applications", "titanium-dioxide-for-printing-inks"), { recursive: true }),
    mkdir(join(directory, "static", "applications", "titanium-dioxide-for-paper"), { recursive: true }),
    mkdir(join(directory, "static", "products", "m-350"), { recursive: true }),
    mkdir(join(directory, "static", "404"), { recursive: true }),
  ]);
  await Promise.all(
    [
      "static/index.html",
      "static/applications/index.html",
      "static/applications/titanium-dioxide-for-coatings/index.html",
      "static/applications/titanium-dioxide-for-plastics/index.html",
      "static/applications/titanium-dioxide-for-masterbatch/index.html",
      "static/applications/titanium-dioxide-for-printing-inks/index.html",
      "static/applications/titanium-dioxide-for-paper/index.html",
      "static/products/index.html",
      "static/products/m-350/index.html",
      "static/404/index.html",
    ].map(async (path) => {
      await mkdir(join(directory, path, ".."), { recursive: true });
      await writeFile(join(directory, path), "<!doctype html>", "utf8");
    }),
  );

  const config = {
    version: 3,
    routes: [
      { src: "^/legacy$", status: 308, headers: { Location: "/" } },
      ...(includeFilesystemHandle ? [{ handle: "filesystem" }] : []),
      { src: "/.*", status: 404 },
    ],
    overrides: {
      "index.html": { path: "index", contentType: "text/html" },
      "applications/index.html": {
        path: "applications/index",
        contentType: "text/html",
      },
      "applications/titanium-dioxide-for-coatings/index.html": {
        path: "applications/titanium-dioxide-for-coatings/index",
        contentType: "text/html",
      },
      "applications/titanium-dioxide-for-plastics/index.html": {
        path: "applications/titanium-dioxide-for-plastics/index",
        contentType: "text/html",
      },
      "applications/titanium-dioxide-for-masterbatch/index.html": {
        path: "applications/titanium-dioxide-for-masterbatch/index",
        contentType: "text/html",
      },
      "applications/titanium-dioxide-for-printing-inks/index.html": {
        path: "applications/titanium-dioxide-for-printing-inks/index",
        contentType: "text/html",
      },
      "applications/titanium-dioxide-for-paper/index.html": {
        path: "applications/titanium-dioxide-for-paper/index",
        contentType: "text/html",
      },
      "products/index.html": {
        path: "products/index",
        contentType: "text/html",
      },
      "products/m-350/index.html": {
        path: "products/m-350/index",
        contentType: "text/html",
      },
      "404/index.html": { path: "404/index", contentType: "text/html" },
    },
  };
  await writeFile(join(directory, "config.json"), JSON.stringify(config), "utf8");
  return directory;
}

test("adds directory-index routes before the filesystem handler", async () => {
  const directory = await fixture();

  assert.deepEqual(await prepareVercelOutput(directory), { routes: 9 });
  assert.deepEqual(await prepareVercelOutput(directory), { routes: 9 });

  const config = JSON.parse(await readFile(join(directory, "config.json"), "utf8"));
  const filesystemIndex = config.routes.findIndex(
    (route) => route.handle === "filesystem",
  );
  assert.deepEqual(config.routes.slice(filesystemIndex - 9, filesystemIndex), [
    { src: "^/$", dest: "/index" },
    { src: "^/applications/$", dest: "/applications/index" },
    {
      src: "^/applications/titanium\\-dioxide\\-for\\-coatings/$",
      dest: "/applications/titanium-dioxide-for-coatings/index",
    },
    {
      src: "^/applications/titanium\\-dioxide\\-for\\-masterbatch/$",
      dest: "/applications/titanium-dioxide-for-masterbatch/index",
    },
    {
      src: "^/applications/titanium\\-dioxide\\-for\\-paper/$",
      dest: "/applications/titanium-dioxide-for-paper/index",
    },
    {
      src: "^/applications/titanium\\-dioxide\\-for\\-plastics/$",
      dest: "/applications/titanium-dioxide-for-plastics/index",
    },
    {
      src: "^/applications/titanium\\-dioxide\\-for\\-printing\\-inks/$",
      dest: "/applications/titanium-dioxide-for-printing-inks/index",
    },
    { src: "^/products/$", dest: "/products/index" },
    {
      src: "^/products/m\\-350/$",
      dest: "/products/m-350/index",
    },
  ]);
});

test("refuses an output config without a filesystem handler", async () => {
  const directory = await fixture({ includeFilesystemHandle: false });
  await assert.rejects(
    () => prepareVercelOutput(directory),
    /filesystem handler/i,
  );
});
