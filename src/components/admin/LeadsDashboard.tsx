"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { APP, callAdminFunction, getAppwrite } from "@/lib/appwrite";
import type { Lead, LeadInterest } from "@/lib/leads";
import type { AdminUser } from "@/lib/adminAuth";
import { signOut } from "@/lib/adminAuth";
import { BroadcastPanel } from "./BroadcastPanel";
import { Insights } from "./Insights";
import { TrashIcon, UserPlusIcon, WhatsAppIcon } from "../Icons";

const IST = "Asia/Kolkata";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

const waLink = (mobile: string, text: string) =>
  `https://wa.me/91${mobile.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(text)}`;

export const DEMO_LEADS: Lead[] = [
  { $id: "d1", name: "Priya Sharma", mobile: "9876543210", email: "priya@example.com", interest: "fashion", whatsappOptIn: true, source: "qr_code", utmSource: "qr_code", utmMedium: "scanner", utmCampaign: "comming_soon_scanner", device: "mobile", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(), $updatedAt: "" },
  { $id: "d2", name: "Ramesh Kumar", mobile: "9812233445", email: "ramesh@example.com", interest: "homeware", whatsappOptIn: true, source: "qr_code", utmSource: "qr_code", utmMedium: "scanner", utmCampaign: "counter_stand", device: "mobile", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), $updatedAt: "" },
  { $id: "d3", name: "Anita Verma", mobile: "9701122334", email: "", interest: "both", whatsappOptIn: false, source: "qr_code", utmSource: "qr_code", utmMedium: "scanner", utmCampaign: "comming_soon_scanner", device: "mobile", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), $updatedAt: "" },
  { $id: "d4", name: "Suresh Gupta", mobile: "9654433221", email: "suresh@example.com", interest: "fashion", whatsappOptIn: true, source: "instagram", utmSource: "instagram", utmMedium: "social", utmCampaign: "profile_link", device: "mobile", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), $updatedAt: "" },
  { $id: "d5", name: "Neha Agarwal", mobile: "9988776655", email: "neha@example.com", interest: "homeware", whatsappOptIn: true, source: "qr_code", utmSource: "qr_code", utmMedium: "scanner", utmCampaign: "flex_board", device: "tablet", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), $updatedAt: "" },
];

const STATUSES = [
  "new",
  "contacted",
  "interested",
  "shopped",
  "converted",
  "not-interested",
  "closed",
] as const;

export function LeadsDashboard({ user, demo = false }: { user: AdminUser; demo?: boolean }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | LeadInterest>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshedAt, setRefreshedAt] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [savingId, setSavingId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [flash, setFlash] = useState("");

  // Server-side pagination: only one page of rows is ever transferred.
  const [pageSize, setPageSize] = useState(25);
  const [cursor, setCursor] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [stack, setStack] = useState<{ cursor: string | null; page: number }[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    if (demo) {
      setLeads(DEMO_LEADS);
      setTotal(DEMO_LEADS.length);
      setRefreshedAt(new Date().toISOString());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { tablesDB } = await getAppwrite();
      const { Query } = await import("appwrite");
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(pageSize),
        ...(statusFilter !== "all" ? [Query.equal("status", statusFilter)] : []),
        ...(cursor ? [Query.cursorAfter(cursor)] : []),
      ];
      const res = await tablesDB.listRows({
        databaseId: APP.databaseId,
        tableId: APP.leadsCollectionId,
        queries,
        total: true,
      });
      setLeads((res.rows ?? []) as unknown as Lead[]);
      setTotal(res.total ?? 0);
      setRefreshedAt(new Date().toISOString());
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — check that your account is in the "admins" team.`
          : "Could not load leads."
      );
    } finally {
      setLoading(false);
    }
  }, [demo, pageSize, cursor, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (demo) return;
    await remove(id);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      const matchesFilter = filter === "all" || (l.interest ?? "unknown") === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return [l.name, l.mobile, l.email ?? ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [leads, query, filter]);

  const stats = useMemo(() => {
    const todayKey = (iso: string) =>
      new Date(iso).toLocaleDateString("en-CA", { timeZone: IST });
    const today = todayKey(new Date().toISOString());
    return {
      total: leads.length,
      today: leads.filter((l) => todayKey(l.$createdAt) === today).length,
      fashion: leads.filter((l) => l.interest === "fashion").length,
      homeware: leads.filter((l) => l.interest === "homeware").length,
      whatsapp: leads.filter((l) => l.whatsappOptIn).length,
    };
  }, [leads]);

  function exportCsv() {
    const header = ["Name", "Mobile", "Email", "Interest", "WhatsApp opt-in", "Date (IST)", "Time (IST)"];
    const rows = filtered.map((l) => [
      l.name,
      l.mobile,
      l.email ?? "",
      l.interest ?? "",
      l.whatsappOptIn ? "yes" : "no",
      fmtDate(l.$createdAt),
      fmtTime(l.$createdAt),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `aggarwal-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(id: string) {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      const { tablesDB } = await getAppwrite();
      await tablesDB.deleteRow({
        databaseId: APP.databaseId,
        tableId: APP.leadsCollectionId,
        rowId: id,
      });
      setLeads((prev) => prev.filter((l) => l.$id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  const withEmail = useMemo(() => leads.filter((l) => l.email).length, [leads]);
  const lastId = leads.length ? leads[leads.length - 1].$id : null;
  const hasNext = leads.length === pageSize && lastId !== null;

  function nextPage() {
    if (!lastId) return;
    setStack((s) => [...s, { cursor, page }]);
    setCursor(lastId);
    setPage((p) => p + 1);
  }

  function prevPage() {
    const prev = stack[stack.length - 1];
    if (!prev) return;
    setStack((s) => s.slice(0, -1));
    setCursor(prev.cursor);
    setPage(prev.page);
  }

  function resetPaging() {
    setStack([]);
    setCursor(null);
    setPage(1);
  }

  function changeStatus(next: string) {
    setStatusFilter(next);
    resetPaging();
    setSelected([]);
  }

  function changePageSize(next: number) {
    setPageSize(next);
    resetPaging();
  }

  /**
   * Converts a lead into a real Appwrite Auth user.
   *
   * Uses the Web SDK's account.create() — the same call the customer sign-up
   * form makes — so no server API key is needed. If self-registration is
   * disabled in the console we fall back to the `make-user` action on the
   * send-broadcast function (that path needs a key with users.write).
   */
  async function convertToUser(lead: Lead) {
    if (!lead.email) {
      setFlash("That lead has no email address, so no account can be created.");
      return;
    }
    if (!confirm(`Create an Appwrite account for ${lead.email}?`)) return;

    setBusyId(lead.$id);
    setFlash("");
    try {
      if (demo) {
        setFlash(`Demo: an account for ${lead.email} would be created.`);
        return;
      }

      const password = `Ah${Math.random().toString(16).slice(2, 10)}!${Math.floor(
        Math.random() * 90 + 10
      )}`;

      let userId = "";
      let tempPassword = password;
      let alreadyExists = false;

      try {
        // account.create() is the same call a customer sign-up makes, so it
        // works without any privileged server key.
        const { account } = await getAppwrite();
        const { ID } = await import("appwrite");
        const user = await account.create({
          userId: ID.unique(),
          email: lead.email,
          password,
          name: lead.name,
        });
        userId = user.$id;
      } catch (err) {
        const code = (err as { code?: number }).code;
        // 401/403 = sign-up is closed in the console.
        // 409     = this email already has an account in the project.
        if (code !== 401 && code !== 403 && code !== 409) throw err;

        // Let the function resolve it: it can look the user up by email and
        // report the existing id (the browser SDK cannot list users).
        const body = await callAdminFunction(APP.broadcastFunctionId, {
          action: "make-user",
          rowId: lead.$id,
        });
        if (body.ok === false) throw new Error(String(body.error ?? "could not create the account"));
        userId = body.userId;
        alreadyExists = Boolean(body.alreadyExists);
        tempPassword = body.password ?? "(existing account — password unchanged)";
      }

      setFlash(
        alreadyExists
          ? `${lead.email} is already an account in Appwrite (user ${userId}) — the password was not changed.`
          : `Account created for ${lead.email} (user ${userId}). Temporary password: ${tempPassword}`
      );
      await saveLead(lead.$id, {
        status: "converted",
        notes: [
          lead.notes,
          alreadyExists
            ? `Matched an existing Appwrite account (${userId}) on ${new Date().toISOString()}`
            : `Converted to an account on ${new Date().toISOString()}`,
        ]
          .filter(Boolean)
          .join("\n")
          .slice(0, 1000),
      });
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusyId("");
    }
  }

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((l) => selected.includes(l.$id));

  function toggleOne(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !filtered.some((l) => l.$id === id))
        : [...new Set([...prev, ...filtered.map((l) => l.$id)])]
    );
  }

  /** Saves status / notes for one lead and keeps $updatedAt visible. */
  async function saveLead(id: string, patch: Partial<Pick<Lead, "status" | "notes">>) {
    setSavingId(id);
    setError("");
    try {
      if (demo) {
        setLeads((prev) =>
          prev.map((l) =>
            l.$id === id
              ? { ...l, ...patch, $updatedAt: new Date().toISOString() }
              : l
          )
        );
        return;
      }
      const { tablesDB } = await getAppwrite();
      const res = await tablesDB.updateRow({
        databaseId: APP.databaseId,
        tableId: APP.leadsCollectionId,
        rowId: id,
        data: patch,
      });
      const updated = res as unknown as Lead;
      setLeads((prev) => prev.map((l) => (l.$id === id ? { ...l, ...updated } : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the changes.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div>
      <div className="adm__bar">
        <div className="adm__brand">
          Aggarwal's House
          <span>Leads · Coming soon</span>
        </div>
        <div className="adm__user">
          <span>{user.email}</span>
          {!demo && (
            <button
              className="btn btn--outline"
              style={{ padding: "10px 16px", fontSize: 11 }}
              onClick={() => void signOut().then(() => location.reload())}
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      {demo && (
        <p className="adm__note adm__note--info" style={{ marginTop: 18 }}>
          <strong>Preview mode</strong> — these are sample rows so you can check the layout.
          Real leads appear once Appwrite is connected. Delete this banner by opening{" "}
          <code>/admin</code> without <code>?demo=1</code>.
        </p>
      )}

      {user.teamMismatch && (
        <p className="adm__note adm__note--err" style={{ marginTop: 18 }} role="status">
          You are signed in through the team <strong>{user.teamName}</strong> (
          <code>{user.teamId}</code>), but <code>NEXT_PUBLIC_APPWRITE_TEAM_ADMINS</code> points at a
          different ID. Set it to <code>{user.teamId}</code>, rebuild, and give the{" "}
          <code>leads</code> collection the same <strong>Team: {user.teamName}</strong> read
          permission.
        </p>
      )}

      <div className="adm__stats">
        <div className="adm__stat">
          <b>{stats.total}</b>
          <span>Total leads</span>
        </div>
        <div className="adm__stat">
          <b>{stats.today}</b>
          <span>Today</span>
        </div>
        <div className="adm__stat">
          <b>{stats.fashion}</b>
          <span>Fashion</span>
        </div>
        <div className="adm__stat">
          <b>{stats.homeware}</b>
          <span>Homeware · {stats.whatsapp} on WhatsApp</span>
        </div>
      </div>

      {error && (
        <p className="adm__note adm__note--err" style={{ marginBottom: 16 }} role="alert">
          {error}
        </p>
      )}

      {flash && (
        <p className="adm__note adm__note--ok" style={{ marginBottom: 16 }} role="status">
          {flash}
        </p>
      )}

      <div className="adm__toolbar">
        <input
          className="input"
          placeholder="Search this page…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => changeStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All stores</option>
          <option value="fashion">Aggarwal Fashion</option>
          <option value="homeware">Aggarwal Homeware</option>
          <option value="both">Both stores</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => changePageSize(Number(e.target.value))}
          title="Rows per page"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <button
          className="btn btn--outline"
          style={{ padding: "11px 16px", fontSize: 11 }}
          onClick={() => void load()}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
        <button
          className="btn btn--outline"
          style={{ padding: "11px 16px", fontSize: 11 }}
          onClick={exportCsv}
        >
          Export CSV
        </button>
        {selected.length > 0 && (
          <button
            className="btn btn--outline"
            style={{ padding: "11px 16px", fontSize: 11 }}
            onClick={() => setSelected([])}
          >
            Clear {selected.length} selected
          </button>
        )}
      </div>

      <div className="adm__table-wrap">
        {filtered.length === 0 ? (
          <p className="adm__empty">{loading ? "Loading leads…" : "No leads yet."}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="adm__pick">
                  <input
                    type="checkbox"
                    aria-label="Select all visible leads"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th>Name</th>
                <th>Contact</th>
                <th>Store</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Received</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.$id} className={selected.includes(l.$id) ? "is-picked" : undefined}>
                  <td className="adm__pick">
                    <input
                      type="checkbox"
                      aria-label={`Select ${l.name}`}
                      checked={selected.includes(l.$id)}
                      onChange={() => toggleOne(l.$id)}
                      disabled={!l.email}
                    />
                  </td>
                  <td>
                    <span className="adm__name">{l.name}</span>
                    <span className="adm__sub">{l.utmCampaign || l.source || "direct"}</span>
                  </td>
                  <td className="adm__contact">
                    {l.mobile ? (
                      <a className="adm__link" href={`tel:+91${l.mobile}`}>
                        {l.mobile}
                      </a>
                    ) : (
                      <span className="adm__sub">no mobile</span>
                    )}
                    {l.email && (
                      <a className="adm__link" href={`mailto:${l.email}`}>
                        {l.email}
                      </a>
                    )}
                  </td>
                  <td>
                    <span className={`adm__tag adm__tag--${l.interest ?? "unknown"}`}>
                      {l.interest === "fashion"
                        ? "Fashion"
                        : l.interest === "homeware"
                          ? "Homeware"
                          : "Both"}
                    </span>
                  </td>
                  <td className="adm__statuscell">
                    <select
                      className="adm__status"
                      value={l.status ?? "new"}
                      disabled={demo || savingId === l.$id}
                      onChange={(e) => void saveLead(l.$id, { status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {l.whatsappOptIn && (
                      <a
                        className="adm__icon adm__icon--wa"
                        title="Open WhatsApp chat"
                        aria-label={`WhatsApp ${l.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={waLink(
                          l.mobile || "",
                          `Hi ${l.name}, this is Aggarwal's House. Your online store access is confirmed.`
                        )}
                      >
                        <WhatsAppIcon size={14} />
                      </a>
                    )}
                  </td>
                  <td className="adm__notecell">
                    <textarea
                      className="adm__notes"
                      rows={2}
                      placeholder="Add a note…"
                      defaultValue={l.notes ?? ""}
                      disabled={demo}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== (l.notes ?? "")) void saveLead(l.$id, { notes: v });
                      }}
                    />
                    {savingId === l.$id && <span className="adm__sub">saving…</span>}
                  </td>
                  <td>
                    {fmtDate(l.$createdAt)}
                    <span className="adm__sub">{fmtTime(l.$createdAt)}</span>
                  </td>
                  <td>
                    {l.$updatedAt && l.$updatedAt !== l.$createdAt ? (
                      <>
                        {fmtDate(l.$updatedAt)}
                        <span className="adm__sub">{fmtTime(l.$updatedAt)}</span>
                      </>
                    ) : (
                      <span className="adm__sub">not edited</span>
                    )}
                  </td>
                  <td className="adm__actions">
                    <button
                      className="adm__icon"
                      title="Create an Appwrite user account from this lead"
                      aria-label={`Create account for ${l.name}`}
                      disabled={!l.email || busyId === l.$id || demo}
                      onClick={() => void convertToUser(l)}
                    >
                      <UserPlusIcon size={15} />
                    </button>
                    {!demo && (
                      <button
                        className="adm__icon adm__icon--danger"
                        title="Delete this lead"
                        aria-label={`Delete ${l.name}`}
                        onClick={() => void handleDelete(l.$id)}
                      >
                        <TrashIcon size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="adm__foot">
        <span>
          Page {page} · showing {filtered.length} of {total} lead(s)
          {refreshedAt && ` · updated ${fmtTime(refreshedAt)}`}
        </span>
        <span className="adm__pager">
          <button
            className="btn btn--outline"
            style={{ padding: "8px 14px", fontSize: 11 }}
            onClick={prevPage}
            disabled={page === 1 || loading}
          >
            ← Previous
          </button>
          <button
            className="btn btn--outline"
            style={{ padding: "8px 14px", fontSize: 11 }}
            onClick={nextPage}
            disabled={!hasNext || loading}
          >
            Next →
          </button>
        </span>
      </p>

      <Insights leads={leads} />

      {!demo && (
        <BroadcastPanel selectedIds={selected} totalWithEmail={withEmail} />
      )}
    </div>
  );
}
