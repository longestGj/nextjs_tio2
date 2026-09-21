import {
  ApplicationDetailRoute,
  applicationDetailMetadata,
} from "@/lib/application-detail-route";
import { applicationDetailPage } from "@/lib/content/application-detail-pages";

const page = applicationDetailPage("titanium-dioxide-for-masterbatch");
export const metadata = applicationDetailMetadata(page);
export default function MasterbatchApplicationPage() {
  return <ApplicationDetailRoute page={page} />;
}
