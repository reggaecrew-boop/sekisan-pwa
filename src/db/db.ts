import Dexie, { Table } from "dexie";
import type { CustomRateSet, Estimate } from "../types";

class SekisanDB extends Dexie {
  customRateSets!: Table<CustomRateSet, string>;
  estimates!: Table<Estimate, string>;

  constructor() {
    super("sekisan-pwa-db");

    this.version(1).stores({
      customRateSets: "id, updatedAt, originBaseSetId, name",
      estimates: "id, updatedAt, name",
    });

    // v2: 見積に工種/明細/諸経費を追加（保存形式が増えただけなので index は据え置き）
    this.version(2)
      .stores({
        customRateSets: "id, updatedAt, originBaseSetId, name",
        estimates: "id, updatedAt, name",
      })
      .upgrade((tx) => {
        // 既存データへの最低限のデフォルト注入
        return tx.table("estimates").toCollection().modify((e: any) => {
          if (!e.workTypes) e.workTypes = [{ id: crypto.randomUUID(), name: "共通", order: 0 }];
          if (!e.lines) e.lines = [];
          if (!e.overhead) e.overhead = { mode: "rate", rate: 0 };
        });
      });
  }
}

export const db = new SekisanDB();
