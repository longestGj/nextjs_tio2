export type Web3FormsOutcome =
  | { readonly kind: "provider_accepted"; readonly status: number }
  | {
      readonly kind: "provider_rejected";
      readonly status: number;
      readonly category: string;
    }
  | { readonly kind: "submission_unconfirmed"; readonly reason: string }
  | { readonly kind: "unavailable"; readonly reason: string };

type Web3FormsRequest = {
  readonly accessKey: string;
  readonly requestToken: string;
  readonly payload: Record<string, string>;
};

type Web3FormsOptions = {
  readonly fetcher?: typeof fetch;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
};

const endpoint = "https://api.web3forms.com/submit";
const accessKeyPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function isJsonResponse(response: Response) {
  const mediaType = response.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  return mediaType === "application/json" || mediaType?.endsWith("+json");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function submitWeb3FormsBrowser(
  request: Web3FormsRequest,
  options: Web3FormsOptions = {},
): Promise<Web3FormsOutcome> {
  if (!accessKeyPattern.test(request.accessKey.trim())) {
    return { kind: "unavailable", reason: "invalid_access_key" };
  }
  if (options.signal?.aborted) {
    return { kind: "submission_unconfirmed", reason: "aborted" };
  }

  const controller = new AbortController();
  let finishTerminal!: (reason: "timeout" | "aborted") => void;
  const terminal = new Promise<{
    readonly type: "terminal";
    readonly reason: "timeout" | "aborted";
  }>((resolve) => {
    finishTerminal = (reason) => resolve({ type: "terminal", reason });
  });
  const onAbort = () => {
    controller.abort();
    finishTerminal("aborted");
  };
  options.signal?.addEventListener("abort", onAbort, { once: true });
  const timeout = window.setTimeout(() => {
    controller.abort();
    finishTerminal("timeout");
  }, options.timeoutMs ?? 10_000);

  const responseRequest = (options.fetcher ?? fetch)(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...request.payload, access_key: request.accessKey }),
    signal: controller.signal,
  })
    .then((response) => ({ type: "response" as const, response }))
    .catch(() => ({ type: "network" as const }));

  try {
    const result = await Promise.race([responseRequest, terminal]);
    if (result.type === "terminal") {
      return { kind: "submission_unconfirmed", reason: result.reason };
    }
    if (result.type === "network") {
      return { kind: "submission_unconfirmed", reason: "network" };
    }

    const { response } = result;
    let providerBody: unknown;
    if (isJsonResponse(response)) {
      try {
        providerBody = await response.json();
      } catch {
        return { kind: "submission_unconfirmed", reason: "invalid_json" };
      }
    } else {
      return { kind: "submission_unconfirmed", reason: "unexpected_media_type" };
    }

    if (
      response.status === 200 &&
      isRecord(providerBody) &&
      providerBody.success === true
    ) {
      return { kind: "provider_accepted", status: response.status };
    }
    if (response.status === 400 || response.status === 422) {
      return {
        kind: "provider_rejected",
        status: response.status,
        category: "invalid_request",
      };
    }
    if (response.status === 429) {
      return {
        kind: "provider_rejected",
        status: response.status,
        category: "rate_limited",
      };
    }
    if (
      response.status === 200 &&
      isRecord(providerBody) &&
      providerBody.success === false
    ) {
      return {
        kind: "provider_rejected",
        status: response.status,
        category: "rejected",
      };
    }
    return {
      kind: "submission_unconfirmed",
      reason: `unexpected_status_${response.status}`,
    };
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onAbort);
  }
}
