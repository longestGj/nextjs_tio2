import {
  ApplicationDetailRoute,
  applicationDetailMetadata,
} from "@/lib/application-detail-route";
import { applicationDetailPage } from "@/lib/content/application-detail-pages";

const page = applicationDetailPage("titanium-dioxide-for-paper");
export const metadata = applicationDetailMetadata(page);
export default function PaperApplicationPage() {
  return <ApplicationDetailRoute page={page} />;
}
