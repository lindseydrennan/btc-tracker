import { TxType } from "@/lib/types";

const styles: Record<TxType, string> = {
  Buy: "bg-blue-900/60 text-blue-300",
  Income: "bg-green-900/60 text-green-300",
  Interest: "bg-green-900/60 text-green-300",
  "CC Reward": "bg-amber-900/60 text-amber-300",
};

export default function Badge({ type }: { type: TxType }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs ${styles[type]}`}
    >
      {type}
    </span>
  );
}
