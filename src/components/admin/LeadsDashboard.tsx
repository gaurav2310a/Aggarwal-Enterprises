"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { APP, getAppwrite } from "@/lib/appwrite";
import type { Lead, LeadInterest } from "@/lib/leads";
import type { AdminUser } from "@/lib/adminAuth";
import { signOut } from "@/lib/adminAuth";
import { BroadcastPanel } from "./BroadcastPanel";

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
  { $id: "d1", name: "Priya Sharma", mobile: "9876543210", email: "priya@example.com", interest: "fashion", whatsappOptIn: true, source: "coming_soon_site", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(), $updatedAt: new Date().toISOString() },
  { $id: "d2", name: "Ramesh Kumar", mobile: "9812233445", email: "ramesh@example.com", interest: "homeware", whatsappOptIn: true, source: "coming_soon_site", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), $updatedAt: new Date().toISOString() },
  { $id: "d3", name: "Anita Verma", mobile: "9701122334", email: "", interest: "both", whatsappOptIn: false, source: "coming_soon_site", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), $updatedAt: new Date().toISOString() },
  { $id: "d4", name: "Suresh Gupta", mobile: "9654433221", email: "suresh@example.com", interest: "fashion", whatsappOptIn: true, source: "coming_soon_site", page: "/", status: "new", $createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), $updatedAt: new Date().toISOString() },
];

export function LeadsDashboard({ user, demo = false }: { user: AdminUser; demo?: boolean }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | LeadInterest>("all");
  const [refreshedAt, setRefreshedAt] = useState<string>("");

  const load = useCallback(async () => {
    if (demo) {
      setLeads(DEMO_LEADS);
      setRefreshedAt(new Date().toISOString());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { databases } = await getAppwrite();
      const { Query } = await import("appwrite");
      const res = await databases.listDocuments({
        databaseId: APP.databaseId,
        collectionId: APP.leadsCollectionId,
        queries: [Query.orderDesc("$createdAt"), Query.limit(200)],
      });
      setLeads(res.documents as unknown as Lead[]);
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
  }, []);

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
      const { databases } = await getAppwrite();
      await databases.deleteDocument({
        databaseId: APP.databaseId,
        collectionId: APP.leadsCollectionId,
        documentId: id,
      });
      setLeads((prev) => prev.filter((l) => l.$id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div>
      <div className="adm__bar">
        <div className="adm__brand">
          Aggarwal House
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

      <div className="adm__toolbar">
        <input
          className="input"
          placeholder="Search name, mobile or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All stores</option>
          <option value="fashion">Aggarwal Fashion</option>
          <option value="homeware">Aggarwal Homeware</option>
          <option value="both">Both stores</option>
        </select>
        <button
          className="btn btn--outline"
          style={{ padding: "11px 16px", fontSize: 11 }}
          onClick={() => void load()}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
        <button
          className="btn btn--ink"
          style={{ padding: "11px 16px", fontSize: 11 }}
          onClick={exportCsv}
        >
          Export CSV
        </button>
      </div>

      <div className="adm__table-wrap">
        {filtered.length === 0 ? (
          <p className="adm__empty">{loading ? "Loading leads…" : "No leads yet."}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Store</th>
                <th>WhatsApp</th>
                <th>Received (IST)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.$id}>
                  <td>
                    <span className="adm__name">{l.name}</span>
                    <span className="adm__sub">{l.source ?? "web"}</span>
                  </td>
                  <td>
                    <a className="adm__link" href={`tel:+91${l.mobile}`}>
                      {l.mobile}
                    </a>
                  </td>
                  <td>
                    {l.email ? (
                      <a className="adm__link" href={`mailto:${l.email}`}>
                        {l.email}
                      </a>
                    ) : (
                      <span className="adm__sub">—</span>
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
                  <td>
                    {l.whatsappOptIn ? (
                      <a
                        className="adm__tag adm__tag--yes"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={waLink(
                          l.mobile,
                          `Hi ${l.name}, this is Aggarwal House. Your online store access is confirmed.`
                        )}
                      >
                        Message
                      </a>
                    ) : (
                      <span className="adm__sub">—</span>
                    )}
                  </td>
                  <td>
                    {fmtDate(l.$createdAt)}
                    <span className="adm__sub">{fmtTime(l.$createdAt)}</span>
                  </td>
                  <td>
                    {!demo && (
                      <button className="adm__danger" onClick={() => void handleDelete(l.$id)}>
                        Delete
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
          Showing {filtered.length} of {leads.length} leads
          {refreshedAt && ` · updated ${fmtTime(refreshedAt)}`}
        </span>
        <span>All timestamps shown in India Standard Time (IST)</span>
      </p>

      {!demo && <BroadcastPanel />}
    </div>
  );
}
