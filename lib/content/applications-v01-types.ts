import type applications from "@/content/applications.json";
import type { Tio2MyGlobalChrome } from "./tio2-my-global-chrome-types";

export type MalaysiaApplicationsHubDto = typeof applications & {
  globalChrome: Tio2MyGlobalChrome;
  routeReadiness: Readonly<Record<string, boolean>>;
};
