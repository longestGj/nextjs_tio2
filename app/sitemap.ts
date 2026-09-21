import type { MetadataRoute } from "next";

import { applicationDetailPages } from "@/lib/content/application-detail-pages";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return applicationDetailPages.map((page) => ({ url: page.canonical }));
}
