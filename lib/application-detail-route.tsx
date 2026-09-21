import type { Metadata } from "next";

import { MalaysiaApplicationDetail } from "@/components/sites/tio2-my/applications/malaysia-application-detail";
import type { ApplicationDetailPage } from "@/lib/content/application-detail-pages";
import { applications } from "@/lib/content/page-data";
import { applicationDetailSchema, JsonLd } from "@/lib/seo";

export function applicationDetailMetadata(page: ApplicationDetailPage): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: page.canonical,
      title: page.title,
      description: page.description,
    },
  };
}

export function ApplicationDetailRoute({
  page,
}: {
  readonly page: ApplicationDetailPage;
}) {
  return (
    <MalaysiaApplicationDetail
      chrome={applications.globalChrome}
      page={page}
      structuredData={<JsonLd value={applicationDetailSchema(page)} />}
    />
  );
}
