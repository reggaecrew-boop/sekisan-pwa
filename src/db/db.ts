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
  }
}

export const db = new SekisanDB();
