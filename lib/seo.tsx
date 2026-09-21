import type { MalaysiaProductDetailDto } from "./content/product-detail-v01-types";
import type { MalaysiaHomepageDto } from "./content/homepage-v04-types";
import type { MalaysiaProductHubDto } from "./content/product-hub-v01-types";
import type { MalaysiaPrivacyPageDto } from "./content/privacy-types";
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

export function privacySchema(p: MalaysiaPrivacyPageDto) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": p.seo.canonical + "#webpage",
        url: p.seo.canonical,
        name: p.title,
        description: p.seo.description,
        isPartOf: ref("website"),
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": p.seo.canonical + "#breadcrumb",
        itemListElement: [
          ["Home", "/"],
          ["Privacy Policy", "/privacy-policy/"],
        ].map(([name, path], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          item: origin + path,
        })),
      },
    ],
  };
}
