import { MalaysiaRfqPage } from "@/components/sites/tio2-my/request-a-quote/malaysia-rfq-page";
import { rfq } from "@/lib/content/page-data";
import { isReceiverConfigured } from "@/lib/forms/rfq-model";
import { JsonLd, rfqSchema } from "@/lib/seo";

export const metadata = {
  title: rfq.seo.title,
  description: rfq.seo.description,
  alternates: { canonical: rfq.seo.canonical },
};

export default function Page() {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  return (
    <MalaysiaRfqPage
      content={rfq}
      accessKey={accessKey}
      receiverAvailable={isReceiverConfigured(accessKey)}
      structuredData={<JsonLd value={rfqSchema(rfq)} />}
    />
  );
}
