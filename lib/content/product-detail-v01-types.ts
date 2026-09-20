import type content from "@/content/m350.json";
import type { Tio2MyGlobalChrome } from "./tio2-my-global-chrome-types";
export type MalaysiaProductDetailDto = typeof content & {
  globalChrome: Tio2MyGlobalChrome;
};
