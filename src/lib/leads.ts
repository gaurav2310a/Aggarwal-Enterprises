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
  | { ok: false; error: string; detail?: string };

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

    // A function can complete and still report a failure in its JSON body.
    let body: Record<string, unknown> = {};
    try {
      body = execution.responseBody ? JSON.parse(execution.responseBody) : {};
    } catch {
      /* non-JSON response is fine */
    }

    if (body.ok === false || !body.documentId) {
      const detail = [
        String(body.error ?? "the deployed function did not return a documentId"),
        body.database ? `db=${body.database}` : "",
        body.collection ? `collection=${body.collection}` : "",
        body.endpoint ? `endpoint=${body.endpoint}` : "",
        body.resendConfigured === false ? "RESEND_API_KEY missing" : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        ok: false,
        error:
          "We could not save your details just now. Please try again, or message us on WhatsApp and we will add you manually.",
        detail,
      };
    }

    return {
      ok: true,
      storedIn: "appwrite",
      documentId: (body.documentId as string) ?? undefined,
      emailed: Boolean(body.emailed),
    };
  } catch (error) {
    console.error("[Aggarwal] lead submission failed, falling back to local queue:", error);
    queueLocal(lead);
    const aw = error as { code?: number; message?: string; type?: string };
    return {
      ok: false,
      error:
        "We could not reach the sign-up service. Please try again, or message us on WhatsApp and we will add you manually.",
      detail: `Appwrite error ${aw.code ?? "?"}: ${aw.message ?? String(error)}`,
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
