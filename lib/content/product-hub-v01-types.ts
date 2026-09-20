import type product from "@/content/products.json";
import type { Tio2MyGlobalChrome } from "./tio2-my-global-chrome-types";
export type MalaysiaProductHubDto = typeof product & {
  globalChrome: Tio2MyGlobalChrome;
  routeReadiness: Readonly<Record<string, boolean>>;
};
