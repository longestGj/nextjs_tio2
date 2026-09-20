import { MalaysiaProductHub } from "@/components/sites/tio2-my/products/malaysia-product-hub";
import { home, products } from "@/lib/content/page-data";
import { JsonLd, productsSchema } from "@/lib/seo";
export const metadata = {
  title: products.seo.title,
  description: products.seo.description,
  alternates: { canonical: products.seo.canonical },
};
export default function Page() {
  return (
    <MalaysiaProductHub
      productHub={products}
      structuredData={
        <JsonLd value={productsSchema(products, home.company.entityName)} />
      }
    />
  );
}
