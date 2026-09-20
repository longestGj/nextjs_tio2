import { MalaysiaProductDetail } from "@/components/sites/tio2-my/products/malaysia-product-detail";
import { m350 } from "@/lib/content/page-data";
import { JsonLd, m350Schema } from "@/lib/seo";
export const metadata = {
  title: m350.seo.title,
  description: m350.seo.description,
  alternates: { canonical: m350.seo.canonical },
};
export default function Page() {
  return (
    <MalaysiaProductDetail
      product={m350}
      structuredData={<JsonLd value={m350Schema(m350)} />}
    />
  );
}
