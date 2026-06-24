interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}

export default function MetricCard({
  label,
  value,
  sub,
  valueClass = "",
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3">
      <p className="mb-1 text-xs text-neutral-400">{label}</p>
      <p className={`text-xl font-medium ${valueClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
    </div>
  );
}
