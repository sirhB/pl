"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";
import { copy } from "@/lib/copy";

export default function RewardsPage() {
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<{
    account: {
      points: number;
      lifetimePts: number;
      transactions: Array<{ points: number; reason: string; createdAt: string }>;
    } | null;
    settings: { redeemPoints: number; redeemDollars: number; pointsPerDollar: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/rewards?phone=${encodeURIComponent(phone)}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Lookup failed");
      return;
    }
    setData(json);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <p className="font-brush text-lg text-fusion-amber">{copy.brandTag}</p>
      <h1 className="font-display text-4xl text-white">{copy.rewardsTitle}</h1>
      <p className="mt-2 text-fusion-muted">{copy.rewardsSub}</p>
      <form onSubmit={lookup} className="mt-6 flex gap-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-3"
        />
        <button className="rounded-lg bg-fusion-yellow px-4 font-bold text-fusion-black">
          Check balance
        </button>
      </form>
      {error && <p className="mt-3 text-fusion-red">{error}</p>}
      {data && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
          {data.account ? (
            <>
              <div className="font-display text-5xl text-fusion-yellow">
                {data.account.points}
              </div>
              <p className="text-sm text-fusion-muted">
                points available · {data.account.lifetimePts} lifetime
              </p>
              <p className="mt-2 text-sm">
                Worth about{" "}
                {formatMoney(
                  Math.floor(data.account.points / data.settings.redeemPoints) *
                    data.settings.redeemDollars *
                    100
                )}{" "}
                in rewards
              </p>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                {data.account.transactions.map((t, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-fusion-muted">{t.reason}</span>
                    <span className={t.points >= 0 ? "text-fusion-green" : "text-fusion-red"}>
                      {t.points >= 0 ? "+" : ""}
                      {t.points}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-fusion-muted">
              No account yet — points land automatically with your first paid order.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
