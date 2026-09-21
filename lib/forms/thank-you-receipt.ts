export type ThankYouRequest = "quote" | "documents" | "sample";

export type ThankYouReceipt = {
  readonly version: 1;
  readonly request: ThankYouRequest;
  readonly succeededAt: number;
  readonly flowId: string;
};

const storageKey = "tio2-my:thank-you:receipt:v1";
const receiptLifetimeMs = 600_000;
const supportedRequests = new Set<ThankYouRequest>([
  "quote",
  "documents",
  "sample",
]);

function isThankYouRequest(value: string | null): value is ThankYouRequest {
  return value !== null && supportedRequests.has(value as ThankYouRequest);
}

function parseReceipt(value: string | null): ThankYouReceipt | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const candidate = parsed as Record<string, unknown>;
    if (
      Object.keys(candidate).sort().join(",") !==
      "flowId,request,succeededAt,version"
    ) {
      return null;
    }
    if (
      candidate.version !== 1 ||
      typeof candidate.request !== "string" ||
      !isThankYouRequest(candidate.request) ||
      typeof candidate.succeededAt !== "number" ||
      !Number.isFinite(candidate.succeededAt) ||
      typeof candidate.flowId !== "string" ||
      candidate.flowId.length === 0
    ) {
      return null;
    }
    return candidate as ThankYouReceipt;
  } catch {
    return null;
  }
}

function getStorage(storage?: Storage) {
  return storage ?? window.sessionStorage;
}

export function resolveMalaysiaThankYouRequest(
  search: string,
  options: { storage?: Storage; now?: number } = {},
): ThankYouRequest | "direct" {
  const parameters = new URLSearchParams(search);
  if (parameters.has("type")) return "direct";
  const requests = parameters.getAll("request");
  if (requests.length !== 1 || !isThankYouRequest(requests[0])) {
    return "direct";
  }

  let storage: Storage;
  let receipt: ThankYouReceipt | null;
  try {
    storage = getStorage(options.storage);
    receipt = parseReceipt(storage.getItem(storageKey));
  } catch {
    return "direct";
  }
  if (!receipt) return "direct";

  const now = options.now ?? Date.now();
  if (
    receipt.succeededAt > now ||
    now - receipt.succeededAt > receiptLifetimeMs
  ) {
    try {
      storage.removeItem(storageKey);
    } catch {
      // The safe visitor outcome is still direct mode.
    }
    return "direct";
  }

  return receipt.request === requests[0] ? receipt.request : "direct";
}

export function writeMalaysiaThankYouReceipt(
  request: ThankYouRequest,
  options: { storage?: Storage; now?: number; flowId?: string } = {},
): void {
  const flowId = options.flowId ?? globalThis.crypto?.randomUUID?.();
  if (!flowId) throw new Error("A secure flow identifier is required");
  const receipt: ThankYouReceipt = {
    version: 1,
    request,
    succeededAt: options.now ?? Date.now(),
    flowId,
  };
  getStorage(options.storage).setItem(storageKey, JSON.stringify(receipt));
}
