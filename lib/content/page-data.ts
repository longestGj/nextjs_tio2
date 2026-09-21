import homeContent from "@/content/home.json";
import chrome from "@/content/chrome.json";
export const home = { ...homeContent, globalChrome: chrome };
import productContent from "@/content/products.json";
export const products = {
  ...productContent,
  globalChrome: chrome,
  routeReadiness: { "GRADE-M350": true } as Readonly<Record<string, boolean>>,
};
import m350Content from "@/content/m350.json";
export const m350 = { ...m350Content, globalChrome: chrome };
import privacyContent from "@/content/privacy.json";
import type { MalaysiaPrivacyPageDto } from "./privacy-types";
export const privacy = {
  ...privacyContent,
  globalChrome: chrome,
} as MalaysiaPrivacyPageDto;
import thankYouContent from "@/content/thank-you.json";
export const thankYou = { ...thankYouContent, globalChrome: chrome };
