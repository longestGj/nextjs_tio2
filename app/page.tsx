import { MalaysiaHomepage } from "@/components/sites/tio2-my/homepage/malaysia-homepage";
import { home } from "@/lib/content/page-data";
import { JsonLd, homeSchema } from "@/lib/seo";
export const metadata = {
  title: home.seo.title,
  description: home.seo.description,
  alternates: { canonical: home.seo.canonical },
};
export default function Page() {
  return (
    <MalaysiaHomepage
      homepage={home}
      structuredData={<JsonLd value={homeSchema(home)} />}
    />
  );
}
