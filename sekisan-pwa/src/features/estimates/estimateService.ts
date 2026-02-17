import { db } from "../../db/db";
import type { Estimate, RateSetRef } from "../../types";

function nowIso() {
  return new Date().toISOString();
}

export async function createEstimate(initialRateSet: RateSetRef): Promise<Estimate> {
  const t = nowIso();
  const est: Estimate = {
    id: crypto.randomUUID(),
    name: `見積 ${t.slice(0, 10)}`,
    createdAt: t,
    updatedAt: t,
    rateSetRef: initialRateSet,
  };
  await db.estimates.put(est);
  return est;
}

export async function listEstimates(): Promise<Estimate[]> {
  return await db.estimates.orderBy("updatedAt").reverse().toArray();
}

export async function getEstimate(id: string): Promise<Estimate | undefined> {
  return await db.estimates.get(id);
}

export async function saveEstimate(est: Estimate): Promise<void> {
  est.updatedAt = nowIso();
  await db.estimates.put(est);
}

export async function deleteEstimate(id: string): Promise<void> {
  await db.estimates.delete(id);
}
