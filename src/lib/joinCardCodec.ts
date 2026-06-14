import { MAX_JOIN_CARD_DECLARATION_LENGTH } from "@/lib/constants";

export type JoinCardPayloadV1 = {
  v: 1;
  name?: string;
  declaration?: string;
  joinedAtISO: string;
  memberNumber?: number;
};

function base64UrlEncode(utf8: string) {
  const b64 = btoa(unescape(encodeURIComponent(utf8)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(b64url: string) {
  const padded = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  const utf8 = decodeURIComponent(escape(atob(padded)));
  return utf8;
}

export function encodeJoinCardPayload(payload: JoinCardPayloadV1) {
  const safe: JoinCardPayloadV1 = {
    v: 1,
    joinedAtISO: payload.joinedAtISO,
  };
  if (payload.name?.trim()) safe.name = payload.name.trim();
  if (payload.declaration?.trim()) {
    safe.declaration = payload.declaration.trim().slice(0, MAX_JOIN_CARD_DECLARATION_LENGTH);
  }
  if (
    typeof payload.memberNumber === "number" &&
    Number.isInteger(payload.memberNumber) &&
    payload.memberNumber > 0
  ) {
    safe.memberNumber = payload.memberNumber;
  }
  return base64UrlEncode(JSON.stringify(safe));
}

export function decodeJoinCardPayload(encoded: string): JoinCardPayloadV1 | null {
  try {
    const raw = JSON.parse(base64UrlDecode(encoded));
    if (!raw || typeof raw !== "object") return null;
    if (raw.v !== 1) return null;
    if (typeof raw.joinedAtISO !== "string") return null;
    if (raw.name != null && typeof raw.name !== "string") return null;
    if (raw.declaration != null && typeof raw.declaration !== "string") return null;
    if (raw.memberNumber != null && typeof raw.memberNumber !== "number") return null;
    return raw as JoinCardPayloadV1;
  } catch {
    return null;
  }
}
