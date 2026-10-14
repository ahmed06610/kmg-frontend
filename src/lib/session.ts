import "server-only";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "kmg_token";

const CLAIM_NAMEIDENTIFIER = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export interface Session {
  token: string;
  userId: string;
  username: string;
  email: string | null;
  employeeId: number;
  roleName: string;
  abilities: string[];
  expiresAt: number; // unix seconds
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf-8");
}

function decodeToken(token: string): Session | null {
  try {
    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) return null;
    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as Record<string, unknown>;

    const abilitiesRaw = typeof payload["abilities"] === "string" ? (payload["abilities"] as string) : "";

    return {
      token,
      userId: String(payload[CLAIM_NAMEIDENTIFIER] ?? ""),
      username: String(payload["sub"] ?? ""),
      email: typeof payload["email"] === "string" ? (payload["email"] as string) : null,
      employeeId: Number(payload["EmployeeId"] ?? 0),
      roleName: String(payload[CLAIM_ROLE] ?? ""),
      abilities: abilitiesRaw ? abilitiesRaw.split(",").filter(Boolean) : [],
      expiresAt: Number(payload["exp"] ?? 0),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const session = decodeToken(token);
  if (!session) return null;
  if (session.expiresAt * 1000 < Date.now()) return null;

  return session;
}

export async function setSessionCookie(token: string): Promise<void> {
  const session = decodeToken(token);
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session ? new Date(session.expiresAt * 1000) : undefined,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

export function hasAbility(session: Session | null, abilityName: string): boolean {
  return !!session?.abilities.includes(abilityName);
}
