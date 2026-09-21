import type { MetadataRoute } from "next";

import { applicationDetailPages } from "@/lib/content/application-detail-pages";
import {
  applications,
  home,
  m350,
  privacy,
  products,
  rfq,
  thankYou,
} from "@/lib/content/page-data";
import { productDetailRegistry } from "@/lib/content/product-detail-registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    home.seo.canonical,
    products.seo.canonical,
    m350.seo.canonical,
    ...productDetailRegistry.map(({ page }) => page.seo.canonical),
    applications.seo.canonical,
    ...applicationDetailPages.map((page) => page.canonical),
    rfq.seo.canonical,
    thankYou.seo.canonical,
    privacy.seo.canonical,
  ].map((url) => ({ url }));
}
