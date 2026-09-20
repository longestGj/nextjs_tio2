import { MalaysiaApplicationsHub } from "@/components/sites/tio2-my/applications/malaysia-applications-hub";
import { applications } from "@/lib/content/page-data";
import { applicationsSchema, JsonLd } from "@/lib/seo";

export const metadata = {
  title: applications.seo.title,
  description: applications.seo.description,
  alternates: { canonical: applications.seo.canonical },
  openGraph: {
    type: "website" as const,
    url: applications.seo.canonical,
    title: applications.seo.shareTitle,
    description: applications.seo.shareDescription,
  },
};

export default function Page() {
  return (
    <MalaysiaApplicationsHub
      applications={applications}
      structuredData={<JsonLd value={applicationsSchema(applications)} />}
    />
  );
}
