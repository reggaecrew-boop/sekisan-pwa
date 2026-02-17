import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CustomRateSet, RateSetData } from "../types";
import { getCustomRateSet, saveCustomRateSet } from "../features/rateSets/rateSetService";

type Tab = "labor" | "equipment" | "consumables" | "overhead";

export default function RateSetEditor() {
  const { id } = useParams();
  const [rs, setRs] = useState<CustomRateSet | null>(null);
  const [tab, setTab] = useState<Tab>("labor");
  const [status, setStatus] = useState("");

  async function refresh() {
    if (!id) return;
    const c = await getCustomRateSet(id);
    if (!c) { setStatus("単価セットが見つからない"); return; }
    setRs(c);
  }

  useEffect(() => { refresh(); }, [id]);

  const tabs = useMemo(() => ([
    { id: "labor" as const, label: "労務（人日）" },
    { id: "equipment" as const, label: "損料" },
    { id: "consumables" as const, label: "消耗品" },
    { id: "overhead" as const, label: "諸経費" },
  ]), []);

  const onSaveName = async (name: string) => {
    if (!rs) return;
    const next = { ...rs, name };
    setRs(next);
    await saveCustomRateSet(next);
    setStatus("保存した");
  };

  const update = async (updater: (d: RateSetData) => RateSetData) => {
    if (!rs) return;
    const next = { ...rs, data: updater(rs.data) };
    setRs(next);
    await saveCustomRateSet(next);
    setStatus("保存した");
  };

  if (!rs) return <div className="card">{status || "読み込み中…"}</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card" style={{ display: "grid", gap: 10 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div><b>単価編集（カスタム）</b></div>
            <div className="small mono">{rs.id}</div>
          </div>
          <div className="hstack">
            <Link className="btn" to="/ratesets">一覧へ</Link>
          </div>
        </div>

        <div className="row">
          <label className="small">名前</label>
          <input className="input" style={{ minWidth: 280 }} value={rs.name} onChange={(e) => onSaveName(e.target.value)} />
          <span className="small">作成元: <span className="mono">{rs.originBaseSetId}</span></span>
          <span className="small">{status}</span>
        </div>

        <div className="tabs">
          {tabs.map((t) => (
            <button key={t.id} className={"tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {tab === "labor" && (
          <RateTable
            title="労務（人日）"
            rows={Object.entries(rs.data.labor).map(([code, v]) => ({ code, name: v.name, unit: v.unit, value: v.unitPriceYen }))}
            onChange={(code, value) => update((d) => ({ ...d, labor: { ...d.labor, [code]: { ...d.labor[code], unitPriceYen: value } } }))}
          />
        )}

        {tab === "equipment" && (
          <RateTable
            title="損料"
            rows={Object.entries(rs.data.equipment).map(([code, v]) => ({ code, name: v.name, unit: v.unit, value: v.unitPriceYen }))}
            onChange={(code, value) => update((d) => ({ ...d, equipment: { ...d.equipment, [code]: { ...d.equipment[code], unitPriceYen: value } } }))}
          />
        )}

        {tab === "consumables" && (
          <RateTable
            title="消耗品"
            rows={Object.entries(rs.data.consumables).map(([code, v]) => ({ code, name: v.name, unit: v.unit, value: v.unitPriceYen }))}
            onChange={(code, value) => update((d) => ({ ...d, consumables: { ...d.consumables, [code]: { ...d.consumables[code], unitPriceYen: value } } }))}
          />
        )}

        {tab === "overhead" && (
          <OverheadTable
            rows={Object.entries(rs.data.overhead).map(([key, v]) => ({ key, name: v.name, unit: v.unit, value: v.value }))}
            onChange={(key, value) => update((d) => ({ ...d, overhead: { ...d.overhead, [key]: { ...d.overhead[key], value } } }))}
          />
        )}

        <div className="small" style={{ marginTop: 10 }}>
          ※ いまはサンプル項目のみ。項目（コード/名称）は <span className="mono">src/rates/baseCatalog2026.ts</span> を増やすと増える
        </div>
      </div>
    </div>
  );
}

function RateTable(props: {
  title: string;
  rows: { code: string; name: string; unit: string; value: number }[];
  onChange: (code: string, value: number) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <b>{props.title}</b>
        <span className="small">値を編集すると保存</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 160 }}>コード</th>
            <th>名称</th>
            <th style={{ width: 120 }}>単位</th>
            <th style={{ width: 180 }}>単価（円）</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={r.code}>
              <td className="mono">{r.code}</td>
              <td>{r.name}</td>
              <td className="mono small">{r.unit}</td>
              <td>
                <input className="input" type="number" min={0} step={1} value={r.value}
                  onChange={(e) => props.onChange(r.code, Number(e.target.value))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverheadTable(props: {
  rows: { key: string; name: string; unit: "rate" | "yen"; value: number }[];
  onChange: (key: string, value: number) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <b>諸経費</b>
        <span className="small">rateは 0.10 = 10% のように入力</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 220 }}>キー</th>
            <th>名称</th>
            <th style={{ width: 100 }}>単位</th>
            <th style={{ width: 180 }}>値</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={r.key}>
              <td className="mono">{r.key}</td>
              <td>{r.name}</td>
              <td className="mono small">{r.unit}</td>
              <td>
                <input className="input" type="number" step={r.unit === "rate" ? 0.01 : 1} value={r.value}
                  onChange={(e) => props.onChange(r.key, Number(e.target.value))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
