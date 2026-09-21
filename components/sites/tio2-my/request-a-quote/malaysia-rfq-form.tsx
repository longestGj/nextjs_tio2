"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type { RfqFormContract } from "@/lib/content/rfq-types";
import {
  resolveRfqPrefill,
  validateRfq,
  type RfqErrors,
  type RfqValues,
} from "@/lib/forms/rfq-model";
import { writeMalaysiaThankYouReceipt } from "@/lib/forms/thank-you-receipt";
import { submitWeb3FormsBrowser } from "@/lib/forms/web3forms-browser";

import styles from "./malaysia-rfq-page.module.css";

const helperIds: Partial<Record<keyof RfqValues, string>> = {
  destination_port_city: "rfq-destination_port_city-helper",
  business_email: "rfq-business_email-helper",
  additional_requirements: "rfq-additional_requirements-helper",
};
const draftFields = [
  "grade_id",
  "application_id",
  "destination_country",
  "additional_requirements",
] as const;
const serverSnapshot = JSON.stringify(["", null]);

function subscribeToRfqContext(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("pageshow", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("pageshow", onStoreChange);
  };
}

function getRfqContextSnapshot() {
  return JSON.stringify([
    window.location.search,
    window.history.state?.rfqDraft ?? null,
  ]);
}

function describedBy(name: keyof RfqValues, hasError: boolean) {
  return [helperIds[name], hasError ? `rfq-${name}-error` : null]
    .filter(Boolean)
    .join(" ") || undefined;
}

export function MalaysiaRfqForm({
  form,
  receiverAvailable,
  accessKey,
  privacyPolicyHref,
}: {
  readonly form: RfqFormContract;
  readonly receiverAvailable: boolean;
  readonly accessKey: string | undefined;
  readonly privacyPolicyHref: string;
}) {
  const snapshot = useSyncExternalStore(
    subscribeToRfqContext,
    getRfqContextSnapshot,
    () => serverSnapshot,
  );
  const [search, draft] = JSON.parse(snapshot) as [string, unknown];
  const context = resolveRfqPrefill(search, draft, form);
  return (
    <MalaysiaRfqFormInner
      key={snapshot}
      form={form}
      receiverAvailable={receiverAvailable}
      accessKey={accessKey}
      privacyPolicyHref={privacyPolicyHref}
      initialValues={context.values}
      sourcePageId={context.sourcePageId}
      interest={context.interest}
    />
  );
}

function MalaysiaRfqFormInner({
  form,
  receiverAvailable,
  accessKey,
  privacyPolicyHref,
  initialValues,
  sourcePageId,
  interest,
}: {
  readonly form: RfqFormContract;
  readonly receiverAvailable: boolean;
  readonly accessKey: string | undefined;
  readonly privacyPolicyHref: string;
  readonly initialValues: Readonly<RfqValues>;
  readonly sourcePageId: string | null;
  readonly interest: string | null;
}) {
  const [values, setValues] = useState<RfqValues>({ ...initialValues });
  const [errors, setErrors] = useState<RfqErrors>({});
  const [submissionState, setSubmissionState] = useState<
    "ready" | "submitting" | "unconfirmed" | "unavailable"
  >(receiverAvailable ? "ready" : "unavailable");
  const [hydrated, setHydrated] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (submissionState === "unconfirmed") {
      failureRef.current?.focus();
    }
  }, [submissionState]);

  if (!receiverAvailable || submissionState === "unavailable") {
    return (
      <div className={styles.stateMessage} role="status">
        <h3>{form.unavailable.heading}</h3>
        <p>{form.unavailable.body}</p>
      </div>
    );
  }

  function update(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const name = event.currentTarget.name as keyof RfqValues;
    const value = event.currentTarget.value;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    const rfqDraft = Object.fromEntries(
      draftFields.map((field) => [field, nextValues[field]]),
    );
    const currentHistoryState =
      window.history.state && typeof window.history.state === "object"
        ? { ...window.history.state }
        : {};
    window.history.replaceState(
      { ...currentHistoryState, rfqDraft },
      "",
      window.location.href,
    );
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function errorFor(name: keyof RfqValues) {
    const error = errors[name];
    return error ? (
      <p className={styles.fieldError} id={`rfq-${name}-error`}>
        {error}
      </p>
    ) : null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    const nextErrors = validateRfq(values, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    if (!accessKey) {
      setSubmissionState("unavailable");
      return;
    }

    pendingRef.current = true;
    setSubmissionState("submitting");
    const requestToken = crypto.randomUUID();
    try {
      const outcome = await submitWeb3FormsBrowser({
        accessKey,
        requestToken,
        payload: {
          subject: "TiO2 Malaysia quotation request",
          from_name: "TiO2 Malaysia RFQ",
          email: values.business_email.trim(),
          site_scope: "tio2-my",
          page_id: "CONV-RFQ",
          workflow_type: "rfq",
          locale: "en",
          request_token: requestToken,
          grade_id: values.grade_id.trim(),
          application_id: values.application_id.trim(),
          quantity_mt: values.quantity_mt.trim(),
          quantity_unit: "MT",
          destination_country: values.destination_country.trim(),
          destination_port_city: values.destination_port_city.trim(),
          company_name: values.company_name.trim(),
          contact_name: values.contact_name.trim(),
          business_email: values.business_email.trim(),
          phone_whatsapp: values.phone_whatsapp.trim(),
          website: values.website.trim(),
          additional_requirements: values.additional_requirements.trim(),
          ...(sourcePageId ? { source_page_id: sourcePageId } : {}),
          ...(interest === "alternative-origin-sourcing" ? { interest } : {}),
        },
      });
      if (outcome.kind === "provider_accepted") {
        writeMalaysiaThankYouReceipt("quote");
        window.location.assign("/thank-you/?request=quote");
        return;
      }
      if (outcome.kind === "unavailable") {
        setSubmissionState("unavailable");
        return;
      }
      setSubmissionState("unconfirmed");
    } catch {
      setSubmissionState("unconfirmed");
    } finally {
      pendingRef.current = false;
    }
  }

  const invalidFields = Object.keys(errors) as (keyof RfqValues)[];
  const common = (name: keyof RfqValues) => ({
    name,
    value: values[name],
    onChange: update,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": describedBy(name, Boolean(errors[name])),
  });

  return (
    <form
      className={styles.form}
      aria-labelledby="rfq-form-heading"
      noValidate
      onSubmit={submit}
    >
      {invalidFields.length > 0 ? (
        <div
          className={styles.errorSummary}
          role="alert"
          tabIndex={-1}
          ref={summaryRef}
        >
          <h3>{form.summary.heading}</h3>
          <p>{form.summary.body}</p>
          <ul>
            {invalidFields.map((name) => (
              <li key={name}>
                <a href={`#rfq-${name}`}>{errors[name]}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {submissionState === "unconfirmed" ? (
        <div
          className={`${styles.stateMessage} ${styles.failureMessage}`}
          role="alert"
          tabIndex={-1}
          ref={failureRef}
        >
          <h3>{form.failure.heading}</h3>
          <p>{form.failure.body}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => setSubmissionState("ready")}
          >
            {form.failure.action}
          </button>
        </div>
      ) : null}

      <fieldset disabled={submissionState === "submitting"}>
        <legend>{form.groups[0]}</legend>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="rfq-grade_id">
              Product / Grade <span aria-hidden="true">*</span>
            </label>
            <select
              id="rfq-grade_id"
              required
              aria-required="true"
              {...common("grade_id")}
            >
              <option value="">Select a product or grade</option>
              {form.gradeOptions.map((option) => (
                <option value={option} key={option}>{option}</option>
              ))}
            </select>
            {errorFor("grade_id")}
          </div>
          <div className={styles.field}>
            <label htmlFor="rfq-application_id">
              Application <span aria-hidden="true">*</span>
            </label>
            <select
              id="rfq-application_id"
              required
              aria-required="true"
              {...common("application_id")}
            >
              <option value="">Select an application</option>
              {form.applicationOptions.map((option) => (
                <option value={option} key={option}>{option}</option>
              ))}
            </select>
            {errorFor("application_id")}
          </div>
          <div className={styles.field}>
            <label htmlFor="rfq-quantity_mt">
              Required Quantity <span aria-hidden="true">*</span>
            </label>
            <div className={styles.quantityControl}>
              <input
                id="rfq-quantity_mt"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="Enter quantity"
                required
                aria-required="true"
                {...common("quantity_mt")}
              />
              <span>Metric tonnes (MT)</span>
            </div>
            {errorFor("quantity_mt")}
          </div>
          <div className={styles.field}>
            <label htmlFor="rfq-destination_country">
              Destination Country <span aria-hidden="true">*</span>
            </label>
            <input
              id="rfq-destination_country"
              type="text"
              maxLength={100}
              placeholder="Enter the destination country"
              required
              aria-required="true"
              {...common("destination_country")}
            />
            {errorFor("destination_country")}
          </div>
          <div className={`${styles.field} ${styles.fullField}`}>
            <label htmlFor="rfq-destination_port_city">
              Destination Port / City (optional)
            </label>
            <input
              id="rfq-destination_port_city"
              type="text"
              maxLength={120}
              {...common("destination_port_city")}
            />
            <p id="rfq-destination_port_city-helper" className={styles.helper}>
              {form.helpers.port}
            </p>
            {errorFor("destination_port_city")}
          </div>
        </div>
      </fieldset>

      <fieldset disabled={submissionState === "submitting"}>
        <legend>{form.groups[1]}</legend>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="rfq-company_name">
              Company Name <span aria-hidden="true">*</span>
            </label>
            <input id="rfq-company_name" type="text" maxLength={160} required aria-required="true" {...common("company_name")} />
            {errorFor("company_name")}
          </div>
          <div className={styles.field}>
            <label htmlFor="rfq-contact_name">
              Your Name <span aria-hidden="true">*</span>
            </label>
            <input id="rfq-contact_name" type="text" maxLength={100} required aria-required="true" {...common("contact_name")} />
            {errorFor("contact_name")}
          </div>
          <div className={styles.field}>
            <label htmlFor="rfq-business_email">
              Business Email <span aria-hidden="true">*</span>
            </label>
            <input id="rfq-business_email" type="email" maxLength={254} placeholder="name@company.com" required aria-required="true" {...common("business_email")} />
            <p id="rfq-business_email-helper" className={styles.helper}>{form.helpers.email}</p>
            {errorFor("business_email")}
          </div>
          <div className={styles.field}>
            <label htmlFor="rfq-phone_whatsapp">Phone / WhatsApp (optional)</label>
            <input id="rfq-phone_whatsapp" type="text" maxLength={40} {...common("phone_whatsapp")} />
            {errorFor("phone_whatsapp")}
          </div>
          <div className={`${styles.field} ${styles.fullField}`}>
            <label htmlFor="rfq-website">Website (optional)</label>
            <input id="rfq-website" type="url" maxLength={2048} placeholder="https://company.com" {...common("website")} />
            {errorFor("website")}
          </div>
        </div>
      </fieldset>

      <fieldset disabled={submissionState === "submitting"}>
        <legend>{form.groups[2]}</legend>
        <div className={styles.field}>
          <label htmlFor="rfq-additional_requirements">
            Additional Requirements (optional)
          </label>
          <textarea id="rfq-additional_requirements" maxLength={2000} rows={5} {...common("additional_requirements")} />
          <p id="rfq-additional_requirements-helper" className={styles.helper}>{form.helpers.requirements}</p>
          {errorFor("additional_requirements")}
        </div>
      </fieldset>

      <div className={styles.privacyNotice}>
        <p>{form.privacy.lead}</p>
        <p>{form.privacy.linkLead} <a href={privacyPolicyHref}>{form.privacy.linkLabel}</a>.</p>
      </div>
      <button
        className={styles.submitButton}
        type="submit"
        disabled={!hydrated || submissionState === "submitting"}
      >
        {submissionState === "submitting"
          ? form.submittingLabel
          : form.submitLabel}
      </button>
    </form>
  );
}
