/**
 * Appwrite (browser SDK) wiring.
 *
 * The SDK is imported lazily (`await import("appwrite")`) so it never lands in
 * the initial bundle of the public coming-soon page — it only downloads when a
 * visitor submits the form or an admin opens /admin.
 *
 * Server-side work (Resend emails, privileged writes) lives in Appwrite
 * Functions under /appwrite/functions — the API keys never touch the browser.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export const APP = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "",
  leadsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION ?? "leads",
  adminsTeamId: process.env.NEXT_PUBLIC_APPWRITE_TEAM_ADMINS ?? "admins",
  createLeadFunctionId: process.env.NEXT_PUBLIC_APPWRITE_FN_CREATE_LEAD ?? "create-lead",
  broadcastFunctionId: process.env.NEXT_PUBLIC_APPWRITE_FN_BROADCAST ?? "send-broadcast",
} as const;

export const isAppwriteConfigured = Boolean(ENDPOINT && PROJECT_ID);

export const ADMIN_SESSION_KEY = "aggarwal_admin_session";

/**
 * Session storage
 * ---------------
 * When the site is served from a domain registered on the Appwrite platform
 * (console: Project > Settings > Platforms > Web App > Domains), Appwrite sets a
 * first-party HttpOnly cookie `a_session_<projectId>` which the browser sends
 * automatically — the SDK never uses localStorage and you never see the
 * "Appwrite is using localStorage for session management" warning.
 *
 * When the domain is NOT registered (or you are on localhost), Appwrite replies
 * with an `X-Fallback-Cookies` header; the SDK prints that warning and keeps the
 * session in localStorage under `cookieFallback`. We detect that state and only
 * then keep our own copy — so a production site is cookie-only.
 */
export function isCookieFallbackMode(): boolean {
  try {
    return Boolean(window.localStorage.getItem("cookieFallback"));
  } catch {
    return true; // assume the weakest mode
  }
}

export type AppwriteKit = {
  client: import("appwrite").Client;
  account: import("appwrite").Account;
  databases: import("appwrite").Databases;
  tablesDB: import("appwrite").TablesDB;
  teams: import("appwrite").Teams;
  functions: import("appwrite").Functions;
};

let kit: AppwriteKit | null = null;

/** Returns a configured Appwrite SDK instance (cached per page load). */
export async function getAppwrite(): Promise<AppwriteKit> {
  if (kit) return kit;
  if (!isAppwriteConfigured) {
    throw new Error(
      "Appwrite is not configured. Set NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID."
    );
  }

  const { Client, Account, Databases, TablesDB, Teams, Functions } = await import("appwrite");

  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

  // Only re-apply a stored secret in cookie-fallback mode (localhost / an
  // unregistered domain). With a registered domain the HttpOnly cookie is sent
  // by the browser on its own and nothing is kept in localStorage.
  if (isCookieFallbackMode()) {
    try {
      const stored = window.localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) client.setSession(stored);
    } catch {
      /* private mode — ignore */
    }
  }

  kit = {
    client,
    account: new Account(client),
    databases: new Databases(client),
    tablesDB: new TablesDB(client),
    teams: new Teams(client),
    functions: new Functions(client),
  };

  return kit;
}

/** Remembers the session locally — ONLY when Appwrite had to fall back to localStorage. */
export function persistFallbackSession(client: import("appwrite").Client, secret: string) {
  client.setSession(secret);
  if (!isCookieFallbackMode()) return;
  try {
    window.localStorage.setItem(ADMIN_SESSION_KEY, secret);
  } catch {
    /* ignore */
  }
}

/** Clears the in-memory session (logout). */
export function clearClientSession(client: import("appwrite").Client) {
  client.config.session = "";
  client.config.jwt = "";
  try {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Calls an admin-only Appwrite Function with the signed-in admin's session,
 * turning the two common failures into plain-language messages:
 *   - session lost / not attached  → "sign in again"
 *   - function execute permission  → "add team:admins in the console"
 */
export async function callAdminFunction(
  functionId: string,
  payload: Record<string, unknown>
) {
  const { functions, account } = await getAppwrite();

  // Fail fast with a clear message if the session is not actually attached.
  try {
    await account.get();
  } catch {
    throw new Error("Your admin session has expired. Sign out and sign in again.");
  }

  try {
    const execution = await functions.createExecution({
      functionId,
      body: JSON.stringify(payload),
      async: false,
    });

    if (execution.status !== "completed") {
      throw new Error(
        `The "${functionId}" function did not complete (${execution.status}). Check its Logs in the Appwrite console.`
      );
    }

    try {
      return execution.responseBody ? JSON.parse(execution.responseBody) : {};
    } catch {
      return {};
    }
  } catch (err) {
    const aw = err as { code?: number; message?: string };
    if (aw.code === 401) {
      throw new Error(
        `Appwrite refused to run "${functionId}". In the console open Functions → ${functionId} → Settings → Execute and set it to Team: ${APP.adminsTeamId} (or "Any" if you prefer).`
      );
    }
    throw err;
  }
}
