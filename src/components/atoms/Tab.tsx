"use client";

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function Tab({ label, active, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1 text-sm font-medium transition-colors ${
        active
          ? "border-neutral-500 bg-neutral-800 text-white"
          : "border-neutral-700 text-neutral-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
