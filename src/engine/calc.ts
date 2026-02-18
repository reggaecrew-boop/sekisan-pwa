import type { Estimate, RateSetData } from "../types";

export type Totals = {
  labor: number;
  equipment: number;
  consumables: number;
  baseSubtotal: number;
  overhead: number;
  grandTotal: number;
};

export function calcLineSubtotalYen(qty: number, unitPriceYen: number): number {
  const q = Number.isFinite(qty) ? qty : 0;
  const u = Number.isFinite(unitPriceYen) ? unitPriceYen : 0;
  return Math.round(q * u);
}

export function calcTotals(est: Estimate): Totals {
  let labor = 0, equipment = 0, consumables = 0;
  for (const line of est.lines) {
    const sub = calcLineSubtotalYen(line.qty, line.unitPriceYen);
    if (line.category === "labor") labor += sub;
    if (line.category === "equipment") equipment += sub;
    if (line.category === "consumables") consumables += sub;
  }
  const baseSubtotal = labor + equipment + consumables;

  let overhead = 0;
  if (est.overhead.mode === "rate") overhead = Math.round(baseSubtotal * est.overhead.rate);
  else overhead = Math.round(est.overhead.yen);

  const grandTotal = baseSubtotal + overhead;
  return { labor, equipment, consumables, baseSubtotal, overhead, grandTotal };
}

export function unitLabel(unit: string): string {
  switch (unit) {
    case "person_day": return "人日";
    case "day": return "日";
    case "can": return "本";
    case "piece": return "個";
    case "set": return "式";
    case "time": return "回";
    default: return unit;
  }
}

/** 単価セット切替時に、見積の明細行単価を「セットの単価」に寄せる（上書き行は保持） */
export function refreshLinePricesFromRateSet(est: Estimate, rates: RateSetData): Estimate {
  const nextLines = est.lines.map((l) => {
    if (l.isUnitPriceOverridden) return l;
    const src = (rates as any)[l.category]?.[l.key];
    if (!src) return l;
    return { ...l, name: src.name, unit: src.unit, unitPriceYen: src.unitPriceYen };
  });
  return { ...est, lines: nextLines };
}
