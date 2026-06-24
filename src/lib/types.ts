export type TxType = "Buy" | "Income" | "Interest" | "CC Reward";

export interface Transaction {
  id: string;
  date: string;
  type: TxType;
  usd: number;
  btc: number;
}

export type SortColumn = "date" | "usd" | "btc" | "price";
export type TabFilter = "purchases" | "cc";
