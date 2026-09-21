import homeContent from "@/content/home.json";
import chrome from "@/content/chrome.json";
import { productDetailRegistry } from "./product-detail-registry";
export const globalChrome = chrome;
const readyProductDetails = Object.fromEntries(
  productDetailRegistry.map(({ pageId }) => [pageId, true] as const),
);
const baseRouteReadiness = {
  "PRODUCT-000": true,
  "GRADE-M350": true,
  "APP-000": true,
} as const;
export const tio2MyRouteReadiness = {
  ...baseRouteReadiness,
  ...readyProductDetails,
} as const satisfies Readonly<Record<string, boolean>>;
export const home = { ...homeContent, globalChrome: chrome };
import productContent from "@/content/products.json";
export const products = {
  ...productContent,
  globalChrome: chrome,
  routeReadiness: tio2MyRouteReadiness,
};
import m350Content from "@/content/m350.json";
export const m350 = { ...m350Content, globalChrome: chrome };
import applicationsContent from "@/content/applications.json";
export const applications = {
  ...applicationsContent,
  globalChrome: chrome,
  routeReadiness: baseRouteReadiness,
};
import privacyContent from "@/content/privacy.json";
import type { MalaysiaPrivacyPageDto } from "./privacy-types";
export const privacy = {
  ...privacyContent,
  globalChrome: chrome,
} as MalaysiaPrivacyPageDto;
import thankYouContent from "@/content/thank-you.json";
export const thankYou = { ...thankYouContent, globalChrome: chrome };
import rfqContent from "@/content/rfq.json";
import type { MalaysiaRfqPageDto } from "./rfq-types";
export const rfq = {
  ...rfqContent,
  globalChrome: chrome,
} as MalaysiaRfqPageDto;
