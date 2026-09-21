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
  "/applications/": {
    canonical: "https://tio2products.com/applications/",
    h1: "Explore Titanium Dioxide by Application",
    robots: "noindex, nofollow",
  },
  "/applications/titanium-dioxide-for-coatings/": {
    canonical: "https://tio2products.com/applications/titanium-dioxide-for-coatings/",
    h1: "Titanium Dioxide for Coatings",
    robots: "index, follow",
  },
  "/applications/titanium-dioxide-for-plastics/": {
    canonical: "https://tio2products.com/applications/titanium-dioxide-for-plastics/",
    h1: "Titanium Dioxide for Plastics",
    robots: "index, follow",
  },
  "/applications/titanium-dioxide-for-masterbatch/": {
    canonical: "https://tio2products.com/applications/titanium-dioxide-for-masterbatch/",
    h1: "Titanium Dioxide for Masterbatch",
    robots: "index, follow",
  },
  "/applications/titanium-dioxide-for-printing-inks/": {
    canonical: "https://tio2products.com/applications/titanium-dioxide-for-printing-inks/",
    h1: "Titanium Dioxide for Printing Inks",
    robots: "index, follow",
  },
  "/applications/titanium-dioxide-for-paper/": {
    canonical: "https://tio2products.com/applications/titanium-dioxide-for-paper/",
    h1: "Titanium Dioxide for Paper",
    robots: "index, follow",
  },
  "/request-a-quote/": {
    canonical: "https://tio2products.com/request-a-quote/",
    h1: "Request a Titanium Dioxide Quote",
    requiredHtml: ['name="grade_id"', 'name="business_email"'],
  },
  "/thank-you/": {
    canonical: "https://tio2products.com/thank-you/",
    h1: "How can we help?",
  },
  "/privacy-policy/": {
    canonical: "https://tio2products.com/privacy-policy/",
    h1: "Privacy Policy",
    requiredHtml: ["Web3Forms", "Last updated: 5 September 2026"],
  },
};

for (const route of Object.values(routes)) {
  if (!route.robots) route.robots = "noindex, nofollow";
}

function page(
  { canonical, h1, robots, requiredHtml = [] },
  { includeAssets = true, omitRequiredHtml = false } = {},
) {
  return `<!doctype html>
    <html><head>
      <meta name="robots" content="${robots}">
      <link rel="canonical" href="${canonical}">
      ${includeAssets ? '<link rel="stylesheet" href="/_next/static/test.css">' : ""}
      ${includeAssets ? '<script src="/_next/static/test.js"></script>' : ""}
    </head><body><h1>${h1}</h1>${omitRequiredHtml ? "" : requiredHtml.join(" ")}</body></html>`;
}

function startFixture({
  brokenProducts = false,
  includeAssets = true,
  assetContentType = "text/javascript",
  emptyScript = false,
  omitRfqMarkup = false,
} = {}) {
  const server = createServer((request, response) => {
    if (request.url === "/_next/static/test.js") {
      response.writeHead(200, { "content-type": assetContentType });
      response.end(emptyScript ? "" : "globalThis.__fixtureLoaded = true;");
      return;
    }

    if (request.url === "/_next/static/test.css") {
      response.writeHead(200, {
        "content-type":
          assetContentType === "text/javascript" ? "text/css" : assetContentType,
      });
      response.end("body { color: black; }");
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
    response.end(
      page(contract, {
        includeAssets,
        omitRequiredHtml:
          omitRfqMarkup && request.url === "/request-a-quote/",
      }),
    );
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
  assert.deepEqual(result, { routes: 12, assets: 2 });
});

test("rejects an RFQ deployment without configured form markup", async () => {
  const fixture = await startFixture({ omitRfqMarkup: true });
  try {
    await assert.rejects(
      () => verifyDeployment(fixture.origin),
      /request-a-quote.*name="grade_id"/i,
    );
  } finally {
    await fixture.close();
  }
});

test("rejects pages without Next.js script and stylesheet assets", async () => {
  const fixture = await startFixture({ includeAssets: false });
  try {
    await assert.rejects(() => verifyDeployment(fixture.origin), /_next.*assets/i);
  } finally {
    await fixture.close();
  }
});

test("rejects asset URLs that return an HTML fallback", async () => {
  const fixture = await startFixture({ assetContentType: "text/html" });
  try {
    await assert.rejects(
      () => verifyDeployment(fixture.origin),
      /_next\/static\/test\.(?:js|css).*content-type.*text\/html/i,
    );
  } finally {
    await fixture.close();
  }
});

test("rejects empty runtime assets", async () => {
  const fixture = await startFixture({ emptyScript: true });
  try {
    await assert.rejects(
      () => verifyDeployment(fixture.origin),
      /_next\/static\/test\.js.*empty/i,
    );
  } finally {
    await fixture.close();
  }
});

test("reports a failed route with its path and status", async () => {
  await assert.rejects(
    () => verifyDeployment(broken.origin),
    /products\/.*404/,
  );
});
