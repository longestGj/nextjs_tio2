import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

import { verifyDeployment } from "../scripts/verify-deployment.mjs";

const routes = {
  "/": {
    canonical: "https://tio2products.com/",
    h1: "Malaysia Titanium Dioxide for Industrial Buyers",
  },
  "/products/": {
    canonical: "https://tio2products.com/products/",
    h1: "Titanium Dioxide Pigment Grades for Industrial Applications",
  },
  "/products/m-350/": {
    canonical: "https://tio2products.com/products/m-350/",
    h1: "M-350 Titanium Dioxide for Multi-Application Evaluation",
  },
};

function page({ canonical, h1 }) {
  return `<!doctype html>
    <html><head>
      <meta name="robots" content="noindex, nofollow">
      <link rel="canonical" href="${canonical}">
      <script src="/_next/static/test.js"></script>
    </head><body><h1>${h1}</h1></body></html>`;
}

function startFixture({ brokenProducts = false } = {}) {
  const server = createServer((request, response) => {
    if (request.url === "/_next/static/test.js") {
      response.writeHead(200, { "content-type": "text/javascript" });
      response.end("globalThis.__fixtureLoaded = true;");
      return;
    }

    if (brokenProducts && request.url === "/products/") {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not found");
      return;
    }

    const contract = routes[request.url];
    if (!contract) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not found");
      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(page(contract));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        origin: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

let healthy;
let broken;

before(async () => {
  [healthy, broken] = await Promise.all([
    startFixture(),
    startFixture({ brokenProducts: true }),
  ]);
});

after(async () => {
  await Promise.all([healthy.close(), broken.close()]);
});

test("verifies all routes and deduplicated Next.js assets", async () => {
  const result = await verifyDeployment(healthy.origin);
  assert.deepEqual(result, { routes: 3, assets: 1 });
});

test("reports a failed route with its path and status", async () => {
  await assert.rejects(
    () => verifyDeployment(broken.origin),
    /products\/.*404/,
  );
});
