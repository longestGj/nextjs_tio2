import homeContent from "@/content/home.json";
import chrome from "@/content/chrome.json";
export const tio2MyRouteReadiness = {
  "HOME-001": true,
  "PRODUCT-000": true,
  "GRADE-M350": true,
  "APP-000": true,
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
  routeReadiness: tio2MyRouteReadiness,
};
