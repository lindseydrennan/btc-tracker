"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Transaction, TxType, SortColumn, TabFilter } from "@/lib/types";
import { loadTransactions, saveTransactions, makeId } from "@/lib/storage";
import { fmtUsd, fmtBtc } from "@/lib/format";
import MetricCard from "@/components/atoms/MetricCard";
import Badge from "@/components/atoms/Badge";
import Tab from "@/components/atoms/Tab";

const TX_TYPES: TxType[] = ["Buy", "Income", "Interest", "CC Reward"];

function getSortVal(t: Transaction, col: SortColumn): string | number {
  if (col === "date") return t.date;
  if (col === "usd") return t.usd;
  if (col === "btc") return t.btc;
  return t.btc > 0 ? t.usd / t.btc : 0;
}

export default function Tracker() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [price, setPrice] = useState(100000);
  const [priceInput, setPriceInput] = useState("100000");
  const [priceStatus, setPriceStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [sortCol, setSortCol] = useState<SortColumn>("date");
  const [sortDir, setSortDir] = useState(-1);
  const [tab, setTab] = useState<TabFilter>("purchases");
  const [mounted, setMounted] = useState(false);

  const dateRef = useRef<HTMLInputElement>(null);
  const usdRef = useRef<HTMLInputElement>(null);
  const btcRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);
  const [csvStatus, setCsvStatus] = useState("");

  useEffect(() => {
    setMounted(true);
    setTxs(loadTransactions());
  }, []);

  const fetchPrice = useCallback(async () => {
    setPriceStatus("loading");
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const p = data.bitcoin.usd as number;
      setPrice(p);
      setPriceInput(String(Math.round(p)));
      setPriceStatus("idle");
    } catch {
      setPriceStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  useEffect(() => {
    if (mounted) saveTransactions(txs);
  }, [txs, mounted]);

  function handleSort(col: SortColumn) {
    if (sortCol === col) setSortDir((d) => d * -1);
    else {
      setSortCol(col);
      setSortDir(-1);
    }
  }

  function addTx() {
    const date = dateRef.current?.value.trim() ?? "";
    const usd = parseFloat(usdRef.current?.value ?? "") || 0;
    const btc = parseFloat(btcRef.current?.value ?? "") || 0;
    const type = (typeRef.current?.value ?? "Buy") as TxType;
    if (!date || btc <= 0) return;
    const next = [
      ...txs,
      { id: makeId(), date, type, usd, btc },
    ].sort((a, b) => a.date.localeCompare(b.date));
    setTxs(next);
    if (dateRef.current) dateRef.current.value = "";
    if (usdRef.current) usdRef.current.value = "";
    if (btcRef.current) btcRef.current.value = "";
  }

  function deleteTx(id: string) {
    setTxs((prev) => prev.filter((t) => t.id !== id));
  }

  function importCSV() {
    const file = csvRef.current?.files?.[0];
    if (!file) {
      setCsvStatus("No file selected.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = (e.target?.result as string)
        .split(/\r?\n/)
        .filter((l) => l.trim());
      let added = 0;
      let skipped = 0;
      const newTxs: Transaction[] = [];
      for (const line of lines) {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 4) {
          skipped++;
          continue;
        }
        const [date, rawType, rawUsd, rawBtc] = cols;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          skipped++;
          continue;
        }
        const btc = parseFloat(rawBtc);
        if (isNaN(btc) || btc <= 0) {
          skipped++;
          continue;
        }
        const type =
          TX_TYPES.find((t) => t.toLowerCase() === rawType.toLowerCase()) ??
          "Buy";
        const usd = parseFloat(rawUsd) || 0;
        newTxs.push({ id: makeId(), date, type, usd, btc });
        added++;
      }
      if (added > 0) {
        setTxs((prev) =>
          [...prev, ...newTxs].sort((a, b) => a.date.localeCompare(b.date))
        );
      }
      if (csvRef.current) csvRef.current.value = "";
      setCsvStatus(
        added > 0
          ? `Added ${added} transaction${added > 1 ? "s" : ""}${skipped ? ` (${skipped} skipped)` : ""}.`
          : `Nothing added${skipped ? ` (${skipped} rows skipped)` : ""}.`
      );
    };
    reader.readAsText(file);
  }

  // Derived state
  let totalUsd = 0;
  let totalBtc = 0;
  let ccBtc = 0;
  for (const t of txs) {
    totalUsd += t.usd;
    totalBtc += t.btc;
    if (t.type === "CC Reward") ccBtc += t.btc;
  }
  const currentVal = totalBtc * price;
  const gain = currentVal - totalUsd;
  const pct = totalUsd > 0 ? (gain / totalUsd) * 100 : 0;
  const avgCost = totalBtc > 0 ? totalUsd / totalBtc : 0;
  const gainClass = gain >= 0 ? "text-emerald-400" : "text-orange-400";
  const sign = gain >= 0 ? "+" : "-";

  const sorted = [...txs].sort((a, b) => {
    const av = getSortVal(a, sortCol);
    const bv = getSortVal(b, sortCol);
    if (av < bv) return -sortDir;
    if (av > bv) return sortDir;
    return 0;
  });

  const filtered = sorted.filter((t) =>
    tab === "cc" ? t.type === "CC Reward" : t.type !== "CC Reward"
  );

  function sortArrow(col: SortColumn) {
    if (sortCol !== col) return null;
    return (
      <span className="ml-1 text-[10px] opacity-70">
        {sortDir === 1 ? "↑" : "↓"}
      </span>
    );
  }

  const thClass = (col: SortColumn) =>
    `cursor-pointer select-none hover:text-white ${sortCol === col ? "text-white" : ""}`;

  if (!mounted) {
    return (
      <div className="py-20 text-center text-neutral-500">Loading…</div>
    );
  }

  return (
    <>
      {/* Price input */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="btc-price" className="text-sm text-neutral-400">
          BTC price (USD):
        </label>
        <input
          id="btc-price"
          type="number"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          className="w-28 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-400"
        />
        <button
          onClick={() => setPrice(parseFloat(priceInput) || price)}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
        >
          Update
        </button>
        <button
          onClick={fetchPrice}
          disabled={priceStatus === "loading"}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700 disabled:opacity-50"
        >
          {priceStatus === "loading" ? "Fetching…" : "Fetch live price"}
        </button>
        {priceStatus === "error" && (
          <span className="text-xs text-orange-400">
            Failed to fetch — try again or enter manually.
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Total invested" value={`$${fmtUsd(totalUsd)}`} />
        <MetricCard label="Total BTC held" value={fmtBtc(totalBtc)} />
        <MetricCard
          label="Current value"
          value={`$${fmtUsd(currentVal)}`}
          sub={`@ $${fmtUsd(price, 0)}/BTC`}
        />
        <MetricCard
          label="Total gain / loss"
          value={`${sign}$${fmtUsd(Math.abs(gain))}`}
          valueClass={gainClass}
        />
        <MetricCard
          label="Return"
          value={`${sign}${fmtUsd(Math.abs(pct))}%`}
          valueClass={gainClass}
        />
        <MetricCard
          label="Avg cost basis"
          value={`$${fmtUsd(avgCost, 0)}`}
          sub="per BTC"
        />
        {ccBtc > 0 && (
          <MetricCard
            label="CC reward BTC"
            value={fmtBtc(ccBtc)}
            sub={`$${fmtUsd(ccBtc * price)} value`}
            valueClass="text-amber-300"
          />
        )}
      </div>

      {/* Add transaction */}
      <h2 className="mb-2 text-sm font-medium text-neutral-400">
        Add a transaction
      </h2>
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          ref={dateRef}
          type="date"
          aria-label="Transaction date"
          className="min-w-[130px] flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-400"
        />
        <input
          ref={usdRef}
          type="number"
          step="0.01"
          placeholder="USD spent"
          aria-label="USD spent"
          className="min-w-[100px] flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-400"
        />
        <input
          ref={btcRef}
          type="number"
          step="0.00000001"
          placeholder="BTC received"
          aria-label="BTC received"
          className="min-w-[100px] flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-400"
        />
        <select
          ref={typeRef}
          aria-label="Transaction type"
          className="min-w-[90px] flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm text-white outline-none focus:border-blue-400"
        >
          {TX_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={addTx}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-1.5 text-sm hover:bg-neutral-700"
        >
          Add
        </button>
      </div>

      {/* CSV import */}
      <h2 className="mb-2 text-sm font-medium text-neutral-400">
        Import from CSV
      </h2>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <input
          ref={csvRef}
          type="file"
          accept=".csv"
          aria-label="CSV file"
          className="min-w-[160px] flex-1 text-sm text-neutral-400 file:mr-3 file:rounded-lg file:border file:border-neutral-700 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-sm file:text-white"
        />
        <button
          onClick={importCSV}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-1.5 text-sm hover:bg-neutral-700"
        >
          Import
        </button>
        {csvStatus && (
          <span className="text-xs text-neutral-400">{csvStatus}</span>
        )}
      </div>
      <p className="mb-6 text-[11px] text-neutral-500">
        CSV columns: Date (YYYY-MM-DD), Type (Buy/Income/Interest/CC Reward),
        USD spent, BTC received
      </p>

      {/* Tabs + table */}
      <div className="mb-3 flex gap-1.5">
        <Tab
          label="Purchases"
          active={tab === "purchases"}
          onClick={() => setTab("purchases")}
        />
        <Tab
          label="CC Rewards"
          active={tab === "cc"}
          onClick={() => setTab("cc")}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-xs text-neutral-400">
              <th
                className={`px-2 py-1.5 ${thClass("date")}`}
                onClick={() => handleSort("date")}
              >
                Date{sortArrow("date")}
              </th>
              <th className="px-2 py-1.5">Type</th>
              <th
                className={`px-2 py-1.5 ${thClass("usd")}`}
                onClick={() => handleSort("usd")}
              >
                USD spent{sortArrow("usd")}
              </th>
              <th
                className={`px-2 py-1.5 ${thClass("btc")}`}
                onClick={() => handleSort("btc")}
              >
                BTC received{sortArrow("btc")}
              </th>
              <th
                className={`px-2 py-1.5 ${thClass("price")}`}
                onClick={() => handleSort("price")}
              >
                Price/BTC{sortArrow("price")}
              </th>
              <th className="px-2 py-1.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="border-b border-neutral-800 last:border-b-0"
              >
                <td className="px-2 py-1.5">{t.date}</td>
                <td className="px-2 py-1.5">
                  <Badge type={t.type} />
                </td>
                <td className="px-2 py-1.5">
                  {t.usd > 0 ? `$${fmtUsd(t.usd)}` : "—"}
                </td>
                <td className="px-2 py-1.5">{fmtBtc(t.btc)}</td>
                <td className="px-2 py-1.5">
                  {t.btc > 0 && t.usd > 0
                    ? `$${fmtUsd(t.usd / t.btc, 0)}`
                    : "—"}
                </td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => deleteTx(t.id)}
                    className="text-xs text-neutral-500 hover:text-red-400"
                    aria-label={`Delete transaction from ${t.date}`}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 py-6 text-center text-neutral-500"
                >
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
