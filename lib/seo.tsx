import type { MalaysiaApplicationsHubDto } from "./content/applications-v01-types";
import type { MalaysiaProductDetailDto } from "./content/product-detail-v01-types";
import type { MalaysiaHomepageDto } from "./content/homepage-v04-types";
import type { MalaysiaProductHubDto } from "./content/product-hub-v01-types";
import type { PublicProductDetail } from "./content/product-detail-types";
const origin = "https://tio2products.com";
export function JsonLd({ value }: { value: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(value).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export function m350Schema(p: MalaysiaProductDetailDto) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": p.seo.canonical + "#product",
        name: "M-350 Titanium Dioxide",
        sku: "M-350",
        url: p.seo.canonical,
        description: p.hero.paragraphs.join(" "),
        additionalProperty: p.technical.rows
          .filter((row) => row.status === "active")
          .map((row) => ({
            "@type": "PropertyValue",
            name: row.property,
            value:
              "Standard: " + row.standard + "; Typical Value: " + row.typical,
          })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          ["Home", "/"],
          ["Products", "/products/"],
          ["M-350", "/products/m-350/"],
        ].map(([name, path], i) => ({
          "@type": "ListItem",
          position: i + 1,
          name,
          item: origin + path,
        })),
      },
    ],
  };
}

export function productDetailSchema(p: PublicProductDetail) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": p.seo.canonical + "#product",
        name: `${p.identity.gradeCode} Titanium Dioxide`,
        sku: p.identity.gradeCode,
        url: p.seo.canonical,
        description: `${p.hero.summaryLead} ${p.hero.summaryBody}`,
        additionalProperty: p.technical.rows.map((row) => {
          const values = Object.values(row);
          return {
            "@type": "PropertyValue",
            name: values[0],
            value: values
              .slice(1)
              .map((value, index) => `${p.technical.columns[index + 1]}: ${value}`)
              .join("; "),
          };
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": p.seo.canonical + "#breadcrumb",
        itemListElement: p.breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: origin + item.href,
        })),
      },
    ],
  };
}
const ref = (name: string) => ({ "@id": origin + "/#" + name });
function entities(company: string) {
  return [
    {
      "@type": "WebSite",
      "@id": origin + "/#website",
      url: origin + "/",
      name: "TiO₂ Malaysia",
      inLanguage: "en",
      publisher: ref("organization"),
    },
    {
      "@type": "Organization",
      "@id": origin + "/#organization",
      name: company,
    },
    { "@type": "Brand", "@id": origin + "/#brand", name: "TiO₂ Malaysia" },
  ];
}
export function homeSchema(home: MalaysiaHomepageDto) {
  const [website, organization, brand] = entities(home.company.entityName);
  return {
    "@context": "https://schema.org",
    "@graph": [
      website,
      {
        "@type": "WebPage",
        "@id": origin + "/#webpage",
        url: origin + "/",
        name: home.hero.heading,
        isPartOf: ref("website"),
        about: [ref("brand"), ref("organization"), ref("titanium-dioxide")],
        inLanguage: "en",
      },
      organization,
      brand,
      {
        "@type": "Product",
        "@id": origin + "/#titanium-dioxide",
        name: "Titanium Dioxide",
        description:
          "Fourteen titanium dioxide grades organised into four product groups.",
        brand: ref("brand"),
        manufacturer: ref("organization"),
      },
    ],
  };
}
export function productsSchema(p: MalaysiaProductHubDto, company: string) {
  const url = p.seo.canonical;
  let position = 0;
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...entities(company),
      {
        "@type": "CollectionPage",
        "@id": url + "#webpage",
        url,
        name: p.hero.h1,
        description: p.seo.description,
        isPartOf: ref("website"),
        inLanguage: "en",
        mainEntity: { "@id": url + "#grade-list" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": url + "#breadcrumb",
        itemListElement: [
          ["Home", "/"],
          ["Products", "/products/"],
        ].map(([name, path], i) => ({
          "@type": "ListItem",
          position: i + 1,
          name,
          item: origin + path,
        })),
      },
      {
        "@type": "ItemList",
        "@id": url + "#grade-list",
        name: p.directory.heading,
        numberOfItems: 14,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: p.directory.groups.flatMap((group) =>
          group.grades.map((grade) => ({
            "@type": "ListItem",
            position: ++position,
            item: {
              "@type": "Product",
              name: grade.gradeId,
              description: grade.summary,
              category: group.label,
              brand: ref("brand"),
              manufacturer: ref("organization"),
              ...(p.routeReadiness[grade.pageId]
                ? {
                    "@id": origin + grade.href + "#product",
                    url: origin + grade.href,
                  }
                : {}),
            },
          })),
        ),
      },
      {
        "@type": "FAQPage",
        "@id": url + "#faq",
        mainEntity: p.buyerQuestions.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}

export function applicationsSchema(p: MalaysiaApplicationsHubDto) {
  const visibleChildren = p.applications.collections.flatMap((collection) =>
    collection.childAction && p.routeReadiness[collection.childAction.targetPageId]
      ? [{ name: collection.title, url: origin + collection.childAction.href }]
      : [],
  );
  const page: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": p.seo.canonical + "#webpage",
    url: p.seo.canonical,
    name: p.hero.h1,
    description: p.seo.description,
    breadcrumb: { "@id": p.seo.canonical + "#breadcrumb" },
    inLanguage: "en",
  };
  if (visibleChildren.length > 0) {
    page.mainEntity = { "@id": p.seo.canonical + "#application-list" };
  }
  const graph: Record<string, unknown>[] = [
    page,
    {
      "@type": "BreadcrumbList",
      "@id": p.seo.canonical + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin + "/" },
        {
          "@type": "ListItem",
          position: 2,
          name: p.breadcrumb.currentLabel,
          item: p.seo.canonical,
        },
      ],
    },
  ];
  if (visibleChildren.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": p.seo.canonical + "#application-list",
      name: p.applications.heading,
      numberOfItems: visibleChildren.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: visibleChildren.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@type": "WebPage", name: item.name, url: item.url },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
