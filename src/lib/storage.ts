import { Transaction } from "./types";

const STORAGE_KEY = "btc-tracker-transactions";

const SAMPLE_DATA: Transaction[] = [
  { id: "s1", date: "2025-01-15", type: "Buy", usd: 500, btc: 0.00512 },
  { id: "s2", date: "2025-02-10", type: "Buy", usd: 250, btc: 0.00261 },
  { id: "s3", date: "2025-03-01", type: "Income", usd: 0, btc: 0.00015 },
  { id: "s4", date: "2025-03-20", type: "Buy", usd: 100, btc: 0.00112 },
  { id: "s5", date: "2025-04-05", type: "CC Reward", usd: 2.5, btc: 0.000025 },
  { id: "s6", date: "2025-04-15", type: "Buy", usd: 100, btc: 0.00098 },
];

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return SAMPLE_DATA;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return SAMPLE_DATA;
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return SAMPLE_DATA;
  }
}

export function saveTransactions(txs: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

let idCounter = 0;
export function makeId(): string {
  return `tx-${Date.now()}-${idCounter++}`;
}
