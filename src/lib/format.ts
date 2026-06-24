export function fmtUsd(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtBtc(n: number): string {
  return n.toFixed(8);
}
