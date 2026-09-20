import { pathToFileURL } from "node:url";

const routeContracts = [
  {
    path: "/",
    canonical: "https://tio2products.com/",
    h1: "Malaysia Titanium Dioxide for Industrial Buyers",
  },
  {
    path: "/products/",
    canonical: "https://tio2products.com/products/",
    h1: "Titanium Dioxide Pigment Grades for Industrial Applications",
  },
  {
    path: "/products/m-350/",
    canonical: "https://tio2products.com/products/m-350/",
    h1: "M-350 Titanium Dioxide for Multi-Application Evaluation",
  },
];

function parseAttributes(tag) {
  const attributes = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = pattern.exec(tag)) !== null) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attributes;
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function normalizeText(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function assertPageContract(html, contract) {
  const canonical = tags(html, "link")
    .map(parseAttributes)
    .find((attributes) =>
      (attributes.get("rel") ?? "")
        .toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    );
  if (canonical?.get("href") !== contract.canonical) {
    throw new Error(`${contract.path} canonical does not match ${contract.canonical}`);
  }

  const robots = tags(html, "meta")
    .map(parseAttributes)
    .find((attributes) => attributes.get("name")?.toLowerCase() === "robots");
  if (!robots?.get("content")?.toLowerCase().split(/[\s,]+/).includes("noindex")) {
    throw new Error(`${contract.path} robots metadata does not include noindex`);
  }

  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!heading || normalizeText(heading[1]) !== contract.h1) {
    throw new Error(`${contract.path} H1 does not match ${contract.h1}`);
  }
}

function collectNextAssets(html, pageUrl) {
  const assets = new Set();

  for (const tag of html.match(/<(?:link|script|img)\b[^>]*>/gi) ?? []) {
    const attributes = parseAttributes(tag);
    for (const name of ["href", "src"]) {
      const value = attributes.get(name);
      if (!value) continue;

      const url = new URL(value, pageUrl);
      if (url.origin === pageUrl.origin && url.pathname.startsWith("/_next/")) {
        assets.add(url.href);
      }
    }
  }

  return assets;
}

async function fetchSuccessful(url, label) {
  const response = await fetch(url, { method: "GET", redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${label} returned ${response.status}`);
  }
  return response;
}

export async function verifyDeployment(baseUrl) {
  const base = new URL(baseUrl);
  if (!new Set(["http:", "https:"]).has(base.protocol)) {
    throw new Error("Deployment URL must use http or https");
  }

  const assets = new Set();
  for (const contract of routeContracts) {
    const pageUrl = new URL(contract.path, base);
    const response = await fetchSuccessful(pageUrl, contract.path);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("text/html")) {
      throw new Error(`${contract.path} returned non-HTML content-type ${contentType || "missing"}`);
    }

    const html = await response.text();
    assertPageContract(html, contract);
    for (const asset of collectNextAssets(html, pageUrl)) assets.add(asset);
  }

  for (const asset of assets) {
    const url = new URL(asset);
    await fetchSuccessful(url, url.pathname);
  }

  return { routes: routeContracts.length, assets: assets.size };
}

const invokedAsScript =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedAsScript) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node scripts/verify-deployment.mjs URL");
    process.exitCode = 1;
  } else {
    try {
      const result = await verifyDeployment(target);
      console.log(JSON.stringify({ url: target, ...result }));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
