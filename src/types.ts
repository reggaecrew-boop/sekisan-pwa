export type UnitCode = "person_day" | "day" | "can" | "piece" | "set" | "time";

export type RateItem = { name: string; unit: UnitCode; unitPriceYen: number };
export type OverheadItem = { name: string; unit: "rate" | "yen"; value: number };

export type RateSetData = {
  labor: Record<string, RateItem>;
  equipment: Record<string, RateItem>;
  consumables: Record<string, RateItem>;
  overhead: Record<string, OverheadItem>;
};

export type BaseRateSet = {
  id: string;
  label: string;
  kind: "base";
  data: RateSetData;
};

export type CustomRateSet = {
  id: string;
  name: string;
  originBaseSetId: string;
  createdAt: string;
  updatedAt: string;
  kind: "custom";
  data: RateSetData;
};

export type RateSetRef =
  | { type: "base"; id: string }
  | { type: "custom"; id: string };

export type WorkType = { id: string; name: string; order: number };

export type EstimateLine = {
  id: string;
  workTypeId: string;
  category: "labor" | "equipment" | "consumables";
  key: string; // rate master key
  name: string; // snapshot name
  unit: UnitCode; // snapshot unit
  qty: number;
  unitPriceYen: number; // effective at time (can be overridden)
  isUnitPriceOverridden?: boolean;
  note?: string;
};

export type OverheadMode =
  | { mode: "rate"; rate: number } // e.g. 0.25
  | { mode: "yen"; yen: number };

export type Estimate = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rateSetRef: RateSetRef;

  workTypes: WorkType[];
  lines: EstimateLine[];
  overhead: OverheadMode;
};
