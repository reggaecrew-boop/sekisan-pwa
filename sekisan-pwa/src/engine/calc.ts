import type { RateSetData } from "../types";

export function calcSampleLaborTotalYen(data: RateSetData, personDays: number): number {
  const unit = data.labor["SURVEYOR"]?.unitPriceYen ?? 0;
  return Math.round(unit * personDays);
}
