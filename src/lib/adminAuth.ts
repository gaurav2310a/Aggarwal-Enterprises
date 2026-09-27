import {
  APP,
  clearClientSession,
  getAppwrite,
  isAppwriteConfigured,
  persistFallbackSession,
} from "./appwrite";

export type AdminUser = {
  $id: string;
  name: string;
  email: string;
};

export type AuthState =
  | { status: "unconfigured" }
  | { status: "signed_out" }
  | { status: "signed_in"; user: AdminUser };

/**
 * Admin access model
 * -------------------
 * Appwrite Auth holds every account, but the `leads` collection is readable
 * ONLY by members of the `admins` team. So "the auth table" effectively contains
 * administrators — a signed-in non-admin gets a 403 from Appwrite and is
 * rejected here too.
 */

export async function signIn(email: string, password: string): Promise<AdminUser> {
  const { account, teams, client } = await getAppwrite();

  const session = await account.createEmailPasswordSession({ email: email.trim(), password });

  // Must be a member of the admins team.
  try {
    await teams.getMembership({ teamId: APP.adminsTeamId, membershipId: session.userId });
  } catch {
    // Not an admin → drop the session immediately.
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      /* ignore */
    }
    clearClientSession(client);
    throw new Error("This account is not registered as an Aggarwal House admin.");
  }

  const user = await account.get();

  // Cookie mode (domain registered on the platform) keeps nothing in
  // localStorage; fallback mode needs our own copy to restore the session.
  persistFallbackSession(client, session.secret);

  return { $id: user.$id, name: user.name, email: user.email };
}

export async function getSession(): Promise<AuthState> {
  if (!isAppwriteConfigured) return { status: "unconfigured" };

  try {
    const { account, teams } = await getAppwrite();
    const user = await account.get();

    try {
      await teams.getMembership({ teamId: APP.adminsTeamId, membershipId: user.$id });
    } catch {
      return { status: "signed_out" };
    }

    return {
      status: "signed_in",
      user: { $id: user.$id, name: user.name, email: user.email },
    };
  } catch {
    return { status: "signed_out" };
  }
}

export async function signOut() {
  const { account, client } = await getAppwrite();
  try {
    await account.deleteSession({ sessionId: "current" });
  } catch {
    /* ignore */
  }
  clearClientSession(client);
}
