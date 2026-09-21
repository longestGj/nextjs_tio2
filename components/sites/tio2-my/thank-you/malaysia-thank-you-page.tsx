import type thankYouContent from "@/content/thank-you.json";
import type { Tio2MyGlobalChrome } from "@/lib/content/tio2-my-global-chrome-types";

import {
  MalaysiaGlobalFooter,
  MalaysiaGlobalHeader,
} from "../malaysia-global-chrome";
import { MalaysiaThankYouPanel } from "./malaysia-thank-you-panel";
import styles from "./malaysia-thank-you-page.module.css";

type ThankYouPageDto = typeof thankYouContent & {
  readonly globalChrome: Tio2MyGlobalChrome;
};

export function MalaysiaThankYouPage({
  content,
}: {
  readonly content: ThankYouPageDto;
}) {
  return (
    <div className={styles.page} data-site-scope="tio2-my" data-page-id={content.pageId}>
      <MalaysiaGlobalHeader
        chrome={content.globalChrome}
        currentPageId="NONE"
        sourcePageId={content.pageId}
      />
      <main className={styles.main}>
        <MalaysiaThankYouPanel
          receiptCue={content.receiptCue}
          states={content.states}
        />
      </main>
      <MalaysiaGlobalFooter chrome={content.globalChrome} sourcePageId={content.pageId} />
    </div>
  );
}
