import type rfqContent from "@/content/rfq.json";

import type { Tio2MyGlobalChrome } from "./tio2-my-global-chrome-types";

export type RfqContent = typeof rfqContent;
export type RfqFormContract = RfqContent["form"];
export type MalaysiaRfqPageDto = RfqContent & {
  readonly globalChrome: Tio2MyGlobalChrome;
};
