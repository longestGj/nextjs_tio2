import type home from "@/content/home.json";
import type { Tio2MyGlobalChrome } from "./tio2-my-global-chrome-types";
export type MalaysiaHomepageDto = typeof home & {
  globalChrome: Tio2MyGlobalChrome;
};
