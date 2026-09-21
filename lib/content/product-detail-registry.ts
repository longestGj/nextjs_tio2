import cr901 from "@/content/product-details/GRADE-CR901_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m108 from "@/content/product-details/GRADE-M108_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m200 from "@/content/product-details/GRADE-M200_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.2.json";
import m210 from "@/content/product-details/GRADE-M210_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m2196 from "@/content/product-details/GRADE-M2196_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m2377 from "@/content/product-details/GRADE-M2377_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m340 from "@/content/product-details/GRADE-M340_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m510 from "@/content/product-details/GRADE-M510_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m52 from "@/content/product-details/GRADE-M52_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m886 from "@/content/product-details/GRADE-M886_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m895 from "@/content/product-details/GRADE-M895_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import m896 from "@/content/product-details/GRADE-M896_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.2.json";
import m996 from "@/content/product-details/GRADE-M996_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json";
import { productDetailCandidates } from "./product-detail-candidates.mjs";
import {
  createPublicProductDetail,
  validateProductDetailEntries,
} from "./product-detail-registry-core.mjs";
import type {
  ProductDetailContract,
  ProductDetailRegistryEntry,
  PublicProductDetail,
} from "./product-detail-types";

const contracts: Record<string, ProductDetailContract> = {
  "GRADE-M510_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m510 as ProductDetailContract,
  "GRADE-M896_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.2.json": m896 as ProductDetailContract,
  "GRADE-M895_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m895 as ProductDetailContract,
  "GRADE-M340_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m340 as ProductDetailContract,
  "GRADE-M886_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m886 as ProductDetailContract,
  "GRADE-M52_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m52 as ProductDetailContract,
  "GRADE-M108_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m108 as ProductDetailContract,
  "GRADE-M210_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m210 as ProductDetailContract,
  "GRADE-M200_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.2.json": m200 as ProductDetailContract,
  "GRADE-M996_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m996 as ProductDetailContract,
  "GRADE-M2196_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m2196 as ProductDetailContract,
  "GRADE-M2377_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": m2377 as ProductDetailContract,
  "GRADE-CR901_PRODUCT_DETAIL_CONTENT_CONTRACT_V0.1.json": cr901 as ProductDetailContract,
};

export const productDetailRegistry = validateProductDetailEntries(
  productDetailCandidates.map((candidate): ProductDetailRegistryEntry => {
    const contract = contracts[candidate.contractFile];
    if (!contract) throw new Error(`Missing product detail contract: ${candidate.contractFile}`);
    return {
      ...candidate,
      page: createPublicProductDetail(contract, candidate) as PublicProductDetail,
    };
  }),
);

const bySlug = new Map(productDetailRegistry.map((entry) => [entry.slug, entry]));

export function getProductDetailBySlug(slug: string) {
  return bySlug.get(slug);
}
