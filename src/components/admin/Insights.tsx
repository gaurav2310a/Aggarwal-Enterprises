"use client";

import { useMemo } from "react";
import type { Lead } from "@/lib/leads";

/**
 * Where the leads came from — the QR codes on the shop boards, posters, counter
 * stands and direct visits.
 */

type Bucket = { label: string; count: number; pct: number };

function bucketize(values: (string | undefined)[], total: number): Bucket[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = (v ?? "").trim() || "Direct / unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, pct: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

function Bar({ title, buckets, accent = false }: { title: string; buckets: Bucket[]; accent?: boolean }) {
  return (
    <div className="ins">
      <h3>{title}</h3>
      {buckets.length === 0 ? (
        <p className="ins__empty">No data yet.</p>
      ) : (
        <ul>
          {buckets.slice(0, 6).map((b) => (
            <li key={b.label}>
              <span className="ins__label" title={b.label}>
                {b.label}
              </span>
              <span className="ins__track">
                <span
                  className={accent ? "ins__fill ins__fill--accent" : "ins__fill"}
                  style={{ width: `${Math.max(4, b.pct)}%` }}
                />
              </span>
              <span className="ins__num">
                {b.count} <em>{b.pct.toFixed(0)}%</em>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Insights({ leads }: { leads: Lead[] }) {
  const data = useMemo(() => {
    const total = leads.length;
    const tracked = leads.filter((l) => l.utmSource || l.source).length;
    return {
      total,
      tracked,
      bySource: bucketize(leads.map((l) => l.utmSource ?? l.source), total),
      byCampaign: bucketize(leads.map((l) => l.utmCampaign), total),
      byMedium: bucketize(leads.map((l) => l.utmMedium), total),
      byDevice: bucketize(leads.map((l) => l.device), total),
      byStore: bucketize(
        leads.map((l) =>
          l.interest === "fashion"
            ? "Aggarwal Fashion"
            : l.interest === "homeware"
              ? "Aggarwal Homeware"
              : "Both stores"
        ),
        total
      ),
      qr: leads.filter((l) => (l.utmSource ?? l.source ?? "").includes("qr")).length,
    };
  }, [leads]);

  if (data.total === 0) return null;

  return (
    <section className="insights">
      <div className="insights__head">
        <div>
          <h2>Where your leads come from</h2>
          <p>
            Captured from the QR codes and printed links. {data.tracked} of {data.total} lead(s)
            arrived through a tracked link.
          </p>
        </div>
        <div className="insights__hero">
          <b>{data.qr}</b>
          <span>QR scans</span>
        </div>
      </div>

      <div className="insights__grid">
        <Bar title="Source (utm_source)" buckets={data.bySource} accent />
        <Bar title="Campaign" buckets={data.byCampaign} />
        <Bar title="Medium" buckets={data.byMedium} />
        <Bar title="Device" buckets={data.byDevice} />
        <Bar title="Store interest" buckets={data.byStore} />
      </div>
    </section>
  );
}
