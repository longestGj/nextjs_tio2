"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type { RfqFormContract } from "@/lib/content/rfq-types";
import {
  emptyRfqValues,
  validateRfq,
  type RfqErrors,
  type RfqValues,
} from "@/lib/forms/rfq-model";

import styles from "./malaysia-rfq-page.module.css";

const helperIds: Partial<Record<keyof RfqValues, string>> = {
  destination_port_city: "rfq-destination_port_city-helper",
  business_email: "rfq-business_email-helper",
  additional_requirements: "rfq-additional_requirements-helper",
};

function describedBy(name: keyof RfqValues, hasError: boolean) {
  return [helperIds[name], hasError ? `rfq-${name}-error` : null]
    .filter(Boolean)
    .join(" ") || undefined;
}

export function MalaysiaRfqForm({
  form,
  receiverAvailable,
  accessKey: _accessKey,
  privacyPolicyHref,
}: {
  readonly form: RfqFormContract;
  readonly receiverAvailable: boolean;
  readonly accessKey: string | undefined;
  readonly privacyPolicyHref: string;
}) {
  void _accessKey;
  const [values, setValues] = useState<RfqValues>(emptyRfqValues);
  const [errors, setErrors] = useState<RfqErrors>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  if (!receiverAvailable) {
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
    setValues((current) => ({ ...current, [name]: value }));
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateRfq(values, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
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

      <fieldset>
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

      <fieldset>
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

      <fieldset>
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
      <button className={styles.submitButton} type="submit">{form.submitLabel}</button>
    </form>
  );
}
