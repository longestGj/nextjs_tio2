import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MalaysiaGradeDetail } from "@/components/sites/tio2-my/products/malaysia-grade-detail";
import { getProductDetailBySlug, productDetailRegistry } from "@/lib/content/product-detail-registry";
import { globalChrome } from "@/lib/content/page-data";
import { JsonLd, productDetailSchema } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return productDetailRegistry.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getProductDetailBySlug(slug);
  if (!entry) notFound();
  const { seo } = entry.page;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: { index: true, follow: true },
    openGraph: { title: seo.title, description: seo.description, url: seo.canonical, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getProductDetailBySlug(slug);
  if (!entry) notFound();
  return (
    <MalaysiaGradeDetail
      product={entry.page}
      chrome={globalChrome}
      structuredData={<JsonLd value={productDetailSchema(entry.page)} />}
    />
  );
}
