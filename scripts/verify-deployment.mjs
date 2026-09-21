import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { productDetailCandidates } from "../lib/content/product-detail-candidates.mjs";

const productDetailRouteContracts = await Promise.all(
  productDetailCandidates.map(async (candidate) => {
    const contract = JSON.parse(
      await readFile(new URL(`../content/product-details/${candidate.contractFile}`, import.meta.url), "utf8"),
    );
    return {
      path: candidate.path,
      canonical: `https://tio2products.com${candidate.path}`,
      h1: contract.seo.h1,
    };
  }),
);

export const routeContracts = [
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
  {
    path: "/applications/",
    canonical: "https://tio2products.com/applications/",
    h1: "Explore Titanium Dioxide by Application",
  },
  {
    path: "/request-a-quote/",
    canonical: "https://tio2products.com/request-a-quote/",
    h1: "Request a Titanium Dioxide Quote",
    requiredHtml: ['name="grade_id"', 'name="business_email"'],
  },
  {
    path: "/thank-you/",
    canonical: "https://tio2products.com/thank-you/",
    h1: "How can we help?",
  },
  {
    path: "/privacy-policy/",
    canonical: "https://tio2products.com/privacy-policy/",
    h1: "Privacy Policy",
    requiredHtml: ["Web3Forms", "Last updated: 5 September 2026"],
  },
  ...productDetailRouteContracts,
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

  for (const required of contract.requiredHtml ?? []) {
    if (!html.includes(required)) {
      throw new Error(`${contract.path} is missing required HTML: ${required}`);
    }
  }
}

function collectNextAssets(html, pageUrl) {
  const assets = new Map();

  for (const tag of html.match(/<(?:link|script|img)\b[^>]*>/gi) ?? []) {
    const attributes = parseAttributes(tag);
    const tagName = tag.match(/^<([a-z]+)/i)?.[1].toLowerCase();
    const rel = (attributes.get("rel") ?? "").toLowerCase().split(/\s+/);
    const as = attributes.get("as")?.toLowerCase();
    for (const name of ["href", "src"]) {
      const value = attributes.get(name);
      if (!value) continue;

      const url = new URL(value, pageUrl);
      if (url.origin === pageUrl.origin && url.pathname.startsWith("/_next/")) {
        let kind = "asset";
        if (tagName === "script" || (rel.includes("preload") && as === "script")) {
          kind = "script";
        } else if (
          tagName === "link" &&
          (rel.includes("stylesheet") || (rel.includes("preload") && as === "style"))
        ) {
          kind = "stylesheet";
        }

        if (!assets.has(url.href)) assets.set(url.href, new Set());
        assets.get(url.href).add(kind);
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

async function verifyAsset(url, kinds) {
  const parsedUrl = new URL(url);
  const response = await fetchSuccessful(parsedUrl, parsedUrl.pathname);
  const contentType = (response.headers.get("content-type") ?? "").toLowerCase();

  if (kinds.has("script") && !contentType.includes("javascript")) {
    throw new Error(`${parsedUrl.pathname} content-type is ${contentType || "missing"}, expected JavaScript`);
  }
  if (kinds.has("stylesheet") && !contentType.startsWith("text/css")) {
    throw new Error(`${parsedUrl.pathname} content-type is ${contentType || "missing"}, expected CSS`);
  }

  const body = await response.arrayBuffer();
  if (body.byteLength === 0) {
    throw new Error(`${parsedUrl.pathname} returned an empty asset`);
  }
}

export async function verifyDeployment(baseUrl) {
  const base = new URL(baseUrl);
  if (!new Set(["http:", "https:"]).has(base.protocol)) {
    throw new Error("Deployment URL must use http or https");
  }

  const assets = new Map();
  for (const contract of routeContracts) {
    const pageUrl = new URL(contract.path, base);
    const response = await fetchSuccessful(pageUrl, contract.path);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("text/html")) {
      throw new Error(`${contract.path} returned non-HTML content-type ${contentType || "missing"}`);
    }

    const html = await response.text();
    assertPageContract(html, contract);
    const pageAssets = collectNextAssets(html, pageUrl);
    const pageKinds = new Set([...pageAssets.values()].flatMap((kinds) => [...kinds]));
    if (!pageKinds.has("script") || !pageKinds.has("stylesheet")) {
      throw new Error(`${contract.path} is missing required _next script or stylesheet assets`);
    }

    for (const [asset, kinds] of pageAssets) {
      if (!assets.has(asset)) assets.set(asset, new Set());
      for (const kind of kinds) assets.get(asset).add(kind);
    }
  }

  for (const [asset, kinds] of assets) {
    await verifyAsset(asset, kinds);
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
