import { redirect, type RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { getRequestEvent } from "$app/server";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const SESSION_VALID_FOR = DAY_IN_MS * 30;
const SESSION_RENEWAL_INTERVAL = DAY_IN_MS * 15;

/** Constant for session token cookie name. */
export const SESSION_COOKIE_NAME = "auth-session";

/** Generates session token. */
export function generateSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const token = encodeBase64url(bytes);
  return token;
}

/** Creates session for user and returns it. */
export async function createSession(token: string, userId: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: schema.Session = {
    sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_VALID_FOR),
  };
  await db.insert(schema.sessions).values(session);
  return session;
}

/** Validates session token and returns session and user. Renews session if necessary. */
export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [result] = await db
    .select({
      user: { id: schema.users.userId, username: schema.users.username },
      session: schema.sessions,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.userId))
    .where(eq(schema.sessions.sessionId, sessionId));

  if (!result) {
    return { session: null, user: null };
  }
  const { session, user } = result;

  const sessionExpiresAtTime = session.expiresAt.getTime();

  const isSessionExpired = Date.now() >= sessionExpiresAtTime;
  if (isSessionExpired) {
    await db.delete(schema.sessions).where(eq(schema.sessions.sessionId, session.sessionId));
    return { session: null, user: null };
  }

  const shouldRenewSession = Date.now() >= sessionExpiresAtTime - SESSION_RENEWAL_INTERVAL;
  if (shouldRenewSession) {
    session.expiresAt = new Date(Date.now() + SESSION_VALID_FOR);
    await db
      .update(schema.sessions)
      .set({ expiresAt: session.expiresAt })
      .where(eq(schema.sessions.sessionId, session.sessionId));
  }

  return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

/** Invalidates session by session ID. Deletes session from database. */
export async function invalidateSession(sessionId: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.sessionId, sessionId));
}

/** Sets session token cookie on request event. */
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
  event.cookies.set(SESSION_COOKIE_NAME, token, {
    expires: expiresAt,
    path: "/",
  });
}

/** Deletes session token cookie from request event. */
export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.delete(SESSION_COOKIE_NAME, {
    path: "/",
  });
}

/** Returns authenticated user from request event or redirects to login page. */
export function requireAuthenticatedUser() {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    return redirect(302, "/auth/login");
  }

  return locals.user;
}
