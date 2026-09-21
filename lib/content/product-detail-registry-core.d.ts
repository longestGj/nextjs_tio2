import type { ProductDetailCandidate, ProductDetailContract, PublicProductDetail, ProductDetailRegistryEntry } from "./product-detail-types";

export function createPublicProductDetail(contract: ProductDetailContract, expected: ProductDetailCandidate): PublicProductDetail;
export function validateProductDetailEntries(entries: ProductDetailRegistryEntry[]): readonly ProductDetailRegistryEntry[];

