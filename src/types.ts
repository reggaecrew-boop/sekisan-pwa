export type RateSetData = {
  labor: Record<string, { name: string; unit: string; unitPriceYen: number }>;
  equipment: Record<string, { name: string; unit: string; unitPriceYen: number }>;
  consumables: Record<string, { name: string; unit: string; unitPriceYen: number }>;
  overhead: Record<string, { name: string; unit: "rate" | "yen"; value: number }>;
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

export type Estimate = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rateSetRef: RateSetRef;
};
