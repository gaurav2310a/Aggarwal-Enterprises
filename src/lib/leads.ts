import { APP, getAppwrite, isAppwriteConfigured } from "./appwrite";

export type LeadInterest = "fashion" | "homeware" | "both" | "unknown";

export type Lead = {
  $id: string;
  name: string;
  mobile: string;
  email?: string;
  interest: LeadInterest;
  whatsappOptIn: boolean;
  source?: string;
  page?: string;
  status?: string;
  notes?: string;
  $createdAt: string;
  $updatedAt: string;
};

export type NewLead = {
  name: string;
  mobile: string;
  email?: string;
  interest: LeadInterest;
  whatsappOptIn: boolean;
  page?: string;
};

export type SubmitResult =
  | { ok: true; storedIn: "appwrite"; documentId?: string; emailed: boolean }
  | { ok: true; storedIn: "local" }
  | { ok: false; error: string };

const LOCAL_KEY = "aggarwal_early_access_leads";

/**
 * Saves a lead through the Appwrite `create-lead` Function, which writes the
 * document to the `leads` collection and sends the Resend emails.
 *
 * If Appwrite is not configured (or is unreachable) the lead is kept in
 * localStorage + console instead, so nothing is ever silently lost.
 */
export async function submitLead(lead: NewLead): Promise<SubmitResult> {
  if (!isAppwriteConfigured) {
    queueLocal(lead);
    return { ok: true, storedIn: "local" };
  }

  try {
    const { functions } = await getAppwrite();
    const execution = await functions.createExecution({
      functionId: APP.createLeadFunctionId,
      body: JSON.stringify(lead),
      async: false, // sync: we want the result (the function also sends the emails)
    });

    if (execution.status !== "completed") {
      throw new Error(`Function status: ${execution.status} — ${execution.responseBody}`);
    }

    let emailed = false;
    let documentId: string | undefined;
    try {
      const body = execution.responseBody ? JSON.parse(execution.responseBody) : {};
      emailed = Boolean(body.emailed);
      documentId = body.documentId;
    } catch {
      /* non-JSON response is fine */
    }

    return { ok: true, storedIn: "appwrite", documentId, emailed };
  } catch (error) {
    console.error("[Aggarwal] lead submission failed, falling back to local queue:", error);
    queueLocal(lead);
    return {
      ok: false,
      error:
        "We could not reach the sign-up service. Please try again, or message us on WhatsApp and we will add you manually.",
    };
  }
}

function queueLocal(lead: NewLead) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]");
    window.localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify([...existing, { ...lead, $createdAt: new Date().toISOString() }])
    );
    console.info("[Aggarwal] Lead queued locally (Appwrite not reachable):", lead);
  } catch {
    /* ignore */
  }
}
