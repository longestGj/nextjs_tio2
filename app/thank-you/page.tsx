import { MalaysiaThankYouPage } from "@/components/sites/tio2-my/thank-you/malaysia-thank-you-page";
import { thankYou } from "@/lib/content/page-data";

export const metadata = {
  title: thankYou.seo.title,
  description: thankYou.seo.description,
  alternates: { canonical: thankYou.seo.canonical },
};

export default function Page() {
  return <MalaysiaThankYouPage content={thankYou} />;
}
