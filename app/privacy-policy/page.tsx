import { MalaysiaPrivacyPage } from "@/components/sites/tio2-my/legal/malaysia-privacy-page";
import { privacy } from "@/lib/content/page-data";
import { JsonLd, privacySchema } from "@/lib/seo";

export const metadata = {
  title: privacy.seo.title,
  description: privacy.seo.description,
  alternates: { canonical: privacy.seo.canonical },
};

export default function Page() {
  return (
    <MalaysiaPrivacyPage
      privacy={privacy}
      structuredData={<JsonLd value={privacySchema(privacy)} />}
    />
  );
}
