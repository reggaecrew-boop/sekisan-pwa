import type { BaseRateSet, CustomRateSet, RateSetData, RateSetRef } from "../../types";
import { db } from "../../db/db";
import { getBaseRateSet, listBaseRateSets } from "../../rates/baseCatalog2026";

export function nowIso() {
  return new Date().toISOString();
}

export function createCustomFromBase(baseSetId: string, name: string): CustomRateSet {
  const base: BaseRateSet = getBaseRateSet(baseSetId);
  const t = nowIso();
  return {
    id: crypto.randomUUID(),
    name: name.trim() || `カスタム単価（${t.slice(0, 10)}）`,
    originBaseSetId: base.id,
    createdAt: t,
    updatedAt: t,
    kind: "custom",
    data: structuredClone(base.data),
  };
}

export async function saveCustomRateSet(rs: CustomRateSet) {
  rs.updatedAt = nowIso();
  await db.customRateSets.put(rs);
}

export async function deleteCustomRateSet(id: string) {
  await db.customRateSets.delete(id);
}

export async function listCustomRateSets(): Promise<CustomRateSet[]> {
  return await db.customRateSets.orderBy("updatedAt").reverse().toArray();
}

export async function getCustomRateSet(id: string): Promise<CustomRateSet | undefined> {
  return await db.customRateSets.get(id);
}

export async function resolveRateSetData(ref: RateSetRef): Promise<RateSetData> {
  if (ref.type === "base") return getBaseRateSet(ref.id).data;
  const c = await getCustomRateSet(ref.id);
  if (!c) throw new Error("カスタム単価セットが見つからない");
  return c.data;
}

export function getBaseOptions() {
  return listBaseRateSets().map((x) => ({ id: x.id, label: x.label }));
}
