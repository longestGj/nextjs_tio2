"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./malaysia-cookie-settings.module.css";
const OPEN_EVENT = "cookie-settings:open";
export function MalaysiaCookieSettingsTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={(event) =>
        window.dispatchEvent(
          new CustomEvent(OPEN_EVENT, {
            detail: { trigger: event.currentTarget },
          }),
        )
      }
    >
      {children}
    </button>
  );
}
export function MalaysiaCookieSettingsHost() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  function close() {
    setOpen(false);
    queueMicrotask(() => trigger.current?.focus());
  }
  useEffect(() => {
    const onOpen = (event: Event) => {
      trigger.current = (
        event as CustomEvent<{ trigger: HTMLElement }>
      ).detail.trigger;
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    if (!element) return;
    const previous = document.documentElement.style.overflow;
    element.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      element.close();
      document.documentElement.style.overflow = previous;
    };
  }, [open]);
  if (!open) return null;
  return (
    <dialog
      ref={dialog}
      className={styles.backdrop}
      aria-labelledby="cookie-settings-title"
      aria-describedby="cookie-settings-description"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href]',
          ),
        );
        const first = focusable.at(0);
        const last = focusable.at(-1);
        if (!first || !last) return;
        const active = document.activeElement;
        if (
          event.shiftKey &&
          (active === first || !event.currentTarget.contains(active))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (active === last || !event.currentTarget.contains(active))
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section className={styles.dialog}>
        <h2 id="cookie-settings-title">Cookie settings</h2>
        <p id="cookie-settings-description">
          No optional Analytics or advertising technology is currently active on
          this site. Necessary functions may use browser storage to operate the
          site and remember an available privacy setting.
        </p>
        <p>Necessary functions remain active.</p>
        <p>Optional Analytics is not active in this runtime.</p>
        <p role="status">Necessary only; Analytics unavailable</p>
        <div className={styles.actions}>
          <button type="button" onClick={close}>
            Close
          </button>
          <a href="/cookie-policy/">Read Cookie Policy</a>
        </div>
      </section>
    </dialog>
  );
}
