import type { RfqFormContract } from "@/lib/content/rfq-types";

export type RfqValues = {
  grade_id: string;
  application_id: string;
  quantity_mt: string;
  destination_country: string;
  destination_port_city: string;
  company_name: string;
  contact_name: string;
  business_email: string;
  phone_whatsapp: string;
  website: string;
  additional_requirements: string;
};

export type RfqErrors = Partial<Record<keyof RfqValues, string>>;

export const emptyRfqValues: RfqValues = {
  grade_id: "",
  application_id: "",
  quantity_mt: "",
  destination_country: "",
  destination_port_city: "",
  company_name: "",
  contact_name: "",
  business_email: "",
  phone_whatsapp: "",
  website: "",
  additional_requirements: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const routingKeyPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const lengthOf = (value: string) => Array.from(value).length;

function isValidWebsite(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function validateRfq(
  values: RfqValues,
  contract: RfqFormContract,
): RfqErrors {
  const errors: RfqErrors = {};
  const grade = values.grade_id.trim();
  const application = values.application_id.trim();
  const quantity = Number(values.quantity_mt);
  const destination = values.destination_country.trim();
  const company = values.company_name.trim();
  const contact = values.contact_name.trim();
  const email = values.business_email.trim();
  const website = values.website.trim();

  if (!contract.gradeOptions.includes(grade)) {
    errors.grade_id = contract.errors.grade_empty;
  }
  if (!contract.applicationOptions.includes(application)) {
    errors.application_id = contract.errors.application_empty;
  }
  if (!values.quantity_mt.trim() || !Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity_mt = contract.errors.quantity_invalid;
  }
  if (!destination) {
    errors.destination_country = contract.errors.destination_empty;
  } else if (lengthOf(destination) > 100) {
    errors.destination_country = contract.errors.destination_too_long;
  }
  if (lengthOf(values.destination_port_city.trim()) > 120) {
    errors.destination_port_city = contract.errors.port_too_long;
  }
  if (lengthOf(company) < 2) {
    errors.company_name = contract.errors.company_missing;
  } else if (lengthOf(company) > 160) {
    errors.company_name = contract.errors.company_too_long;
  }
  if (lengthOf(contact) < 2) {
    errors.contact_name = contract.errors.contact_missing;
  } else if (lengthOf(contact) > 100) {
    errors.contact_name = contract.errors.contact_too_long;
  }
  if (!email) {
    errors.business_email = contract.errors.email_empty;
  } else if (lengthOf(email) > 254 || !emailPattern.test(email)) {
    errors.business_email = contract.errors.email_invalid;
  }
  if (lengthOf(values.phone_whatsapp.trim()) > 40) {
    errors.phone_whatsapp = contract.errors.phone_too_long;
  }
  if (website && (lengthOf(website) > 2048 || !isValidWebsite(website))) {
    errors.website = contract.errors.website_invalid;
  }
  if (lengthOf(values.additional_requirements) > 2000) {
    errors.additional_requirements = contract.errors.requirements_too_long;
  }
  return errors;
}

export function isReceiverConfigured(
  value: string | undefined,
): value is string {
  return typeof value === "string" && routingKeyPattern.test(value.trim());
}
