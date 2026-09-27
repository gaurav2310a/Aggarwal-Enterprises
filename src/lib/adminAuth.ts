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
  /** Team actually used, if it differs from the configured one. */
  teamId?: string;
  teamName?: string;
  teamMismatch?: boolean;
};

export type AuthState =
  | { status: "unconfigured" }
  | { status: "signed_out" }
  | { status: "not_admin"; user: AdminUser; reason: string }
  | { status: "signed_in"; user: AdminUser };

type AwError = { code?: number; message?: string; type?: string };

type TeamCheck =
  | { ok: true; teamId: string; teamName: string; mismatch: boolean }
  | { ok: false; reason: string };

const norm = (s?: string) => (s ?? "").toLowerCase().replace(/[^a-z]/g, "");

/** Accepts one or several team ids, comma separated. */
const CONFIGURED_TEAM_IDS = APP.adminsTeamId
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Works out whether a user is an admin, and gives an actionable answer if not.
 *
 * 1) direct membership lookup on the configured team id
 * 2) otherwise enumerate the user's own teams, look for one whose name contains
 *    "admin", and verify an *accepted* membership (Appwrite sets confirm=false
 *    until the invite is accepted)
 */
async function resolveAdminTeam(
  teams: import("appwrite").Teams,
  userId: string
): Promise<TeamCheck> {
  let directError: AwError | null = null;

  for (const teamId of CONFIGURED_TEAM_IDS) {
    try {
      await teams.getMembership({ teamId, membershipId: userId });
      return { ok: true, teamId, teamName: teamId, mismatch: CONFIGURED_TEAM_IDS.length > 1 };
    } catch (err) {
      directError = err as AwError;
    }
  }

  let myTeams: { $id: string; name?: string }[] = [];
  try {
    myTeams = (await teams.list()).teams.map((t) => ({ $id: t.$id, name: t.name }));
  } catch {
    /* fall through to the generic message */
  }

  const candidates = myTeams.filter(
    (t) => CONFIGURED_TEAM_IDS.includes(t.$id) || norm(t.name).includes("admin")
  );

  for (const team of candidates) {
    try {
      const res = await teams.listMemberships({
        teamId: team.$id,
        queries: [(await import("appwrite")).Query.limit(100)],
      });
      const mine = res.memberships.find((m) => m.userId === userId);

      if (mine && mine.confirm === false) {
        return {
          ok: false,
          reason: `Your invite to the "${mine.teamName || team.name || team.$id}" team has not been accepted yet. Open the link Appwrite emailed you, or accept it in the console (Teams → ${mine.teamName || team.name} → Members).`,
        };
      }
      if (mine) {
        return {
          ok: true,
          teamId: team.$id,
          teamName: mine.teamName || team.name || team.$id,
          mismatch: !CONFIGURED_TEAM_IDS.includes(team.$id),
        };
      }
    } catch {
      /* try the next candidate */
    }
  }

  if (myTeams.length === 0) {
    return {
      ok: false,
      reason: `This account is not a member of any team. Add it in the Appwrite console: Teams → your admins team → Members → Add.`,
    };
  }

  if (candidates.length === 0) {
    return {
      ok: false,
      reason: `No team containing "admin" was found. This account belongs to: ${myTeams
        .map((t) => `"${t.name ?? "?"}" (${t.$id})`)
        .join(", ")}. Set NEXT_PUBLIC_APPWRITE_TEAM_ADMINS to the right ID and rebuild.`,
    };
  }

  return {
    ok: false,
    reason: `Not an accepted member of any admin team. ${directError?.message ?? ""}`.trim(),
  };
}

export async function signIn(email: string, password: string): Promise<AdminUser> {
  const { account, teams, client } = await getAppwrite();

  const session = await account.createEmailPasswordSession({ email: email.trim(), password });

  // Appwrite Web SDK 28 does not attach the new session itself — it relies on
  // the HttpOnly cookie, which is blocked when the site and the API are on
  // different origins. Setting the secret makes both modes work.
  client.setSession(session.secret);

  const check = await resolveAdminTeam(teams, session.userId);

  if (!check.ok) {
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      /* ignore */
    }
    clearClientSession(client);
    throw new Error(check.reason);
  }

  const user = await account.get();
  persistFallbackSession(client, session.secret);

  return {
    $id: user.$id,
    name: user.name,
    email: user.email,
    teamId: check.teamId,
    teamName: check.teamName,
    teamMismatch: check.mismatch,
  };
}

export async function getSession(): Promise<AuthState> {
  if (!isAppwriteConfigured) return { status: "unconfigured" };

  try {
    const { account, teams, client } = await getAppwrite();
    const user = await account.get();
    const check = await resolveAdminTeam(teams, user.$id);

    if (!check.ok) {
      return {
        status: "not_admin",
        user: { $id: user.$id, name: user.name, email: user.email },
        reason: check.reason,
      };
    }

    return {
      status: "signed_in",
      user: {
        $id: user.$id,
        name: user.name,
        email: user.email,
        teamId: check.teamId,
        teamName: check.teamName,
        teamMismatch: check.mismatch,
      },
    };
  } catch (err) {
    if ((err as AwError).code === 401) {
      try {
        const { client } = await getAppwrite();
        clearClientSession(client);
      } catch {
        /* ignore */
      }
    }
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
