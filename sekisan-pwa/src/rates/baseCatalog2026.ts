import type { BaseRateSet, RateSetData } from "../types";

const YEAR = 2026 as const;
const baseData: RateSetData = {
  "labor": {
    "SURVEYOR": {
      "name": "測量士",
      "unit": "person_day",
      "unitPriceYen": 28000
    }
  },
  "equipment": {
    "TS": {
      "name": "トータルステーション",
      "unit": "day",
      "unitPriceYen": 4500
    }
  },
  "consumables": {
    "SPRAY": {
      "name": "マーキングスプレー",
      "unit": "can",
      "unitPriceYen": 600
    }
  },
  "overhead": {
    "overhead.rate": {
      "name": "現場管理費率（例）",
      "unit": "rate",
      "value": 0.25
    },
    "general_admin.rate": {
      "name": "一般管理費率（例）",
      "unit": "rate",
      "value": 0.1
    },
    "tax.rate": {
      "name": "消費税率（例）",
      "unit": "rate",
      "value": 0.1
    }
  }
} as any;

function clone<T>(x: T): T { return structuredClone(x); }

export const BASE_RATESETS_2026: BaseRateSet[] = [
  { id: `MLIT-${YEAR}`, label: `国交省（${YEAR}）`, kind: "base", data: clone(baseData) },
  { id: "PREF-01-2026", label: "北海道（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-02-2026", label: "青森県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-03-2026", label: "岩手県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-04-2026", label: "宮城県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-05-2026", label: "秋田県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-06-2026", label: "山形県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-07-2026", label: "福島県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-08-2026", label: "茨城県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-09-2026", label: "栃木県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-10-2026", label: "群馬県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-11-2026", label: "埼玉県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-12-2026", label: "千葉県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-13-2026", label: "東京都（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-14-2026", label: "神奈川県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-15-2026", label: "新潟県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-16-2026", label: "富山県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-17-2026", label: "石川県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-18-2026", label: "福井県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-19-2026", label: "山梨県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-20-2026", label: "長野県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-21-2026", label: "岐阜県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-22-2026", label: "静岡県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-23-2026", label: "愛知県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-24-2026", label: "三重県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-25-2026", label: "滋賀県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-26-2026", label: "京都府（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-27-2026", label: "大阪府（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-28-2026", label: "兵庫県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-29-2026", label: "奈良県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-30-2026", label: "和歌山県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-31-2026", label: "鳥取県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-32-2026", label: "島根県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-33-2026", label: "岡山県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-34-2026", label: "広島県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-35-2026", label: "山口県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-36-2026", label: "徳島県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-37-2026", label: "香川県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-38-2026", label: "愛媛県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-39-2026", label: "高知県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-40-2026", label: "福岡県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-41-2026", label: "佐賀県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-42-2026", label: "長崎県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-43-2026", label: "熊本県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-44-2026", label: "大分県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-45-2026", label: "宮崎県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-46-2026", label: "鹿児島県（2026）", kind: "base", data: clone(baseData) },
  { id: "PREF-47-2026", label: "沖縄県（2026）", kind: "base", data: clone(baseData) },
];

export function getBaseRateSet(id: string): BaseRateSet {
  const r = BASE_RATESETS_2026.find((x) => x.id === id);
  if (!r) throw new Error(`BaseRateSet not found: ${id}`);
  return r;
}

export function listBaseRateSets(): BaseRateSet[] { return BASE_RATESETS_2026; }
