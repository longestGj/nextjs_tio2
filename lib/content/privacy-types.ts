import type privacyContent from "@/content/privacy.json";

import type { Tio2MyGlobalChrome } from "./tio2-my-global-chrome-types";

export type PrivacyBlock =
  | { readonly type: "paragraph"; readonly text: string }
  | { readonly type: "list"; readonly items: readonly string[] }
  | { readonly type: "subheading"; readonly text: string }
  | { readonly type: "address"; readonly lines: readonly string[] };

export type PrivacySection = {
  readonly id: string;
  readonly heading: string;
  readonly blocks: readonly PrivacyBlock[];
};

export type MalaysiaPrivacyPageDto = Omit<typeof privacyContent, "sections"> & {
  readonly globalChrome: Tio2MyGlobalChrome;
  readonly sections: readonly PrivacySection[];
};
