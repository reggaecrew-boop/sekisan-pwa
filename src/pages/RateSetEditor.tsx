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
            allowEditMeta
            onChangeMeta={(code, patch) => update((d) => ({ ...d, labor: { ...d.labor, [code]: { ...d.labor[code], ...patch } } }))}
            onAdd={(item) => update((d) => ({ ...d, labor: { ...d.labor, [item.code]: { name: item.name, unit: item.unit as any, unitPriceYen: item.value } } }))}
            onDelete={(code) => update((d) => { const next = { ...d.labor }; delete (next as any)[code]; return { ...d, labor: next }; })}
          />
        )}

        {tab === "equipment" && (
          <RateTable
            title="損料"
            rows={Object.entries(rs.data.equipment).map(([code, v]) => ({ code, name: v.name, unit: v.unit, value: v.unitPriceYen }))}
            onChange={(code, value) => update((d) => ({ ...d, equipment: { ...d.equipment, [code]: { ...d.equipment[code], unitPriceYen: value } } }))}
            allowEditMeta
            onChangeMeta={(code, patch) => update((d) => ({ ...d, equipment: { ...d.equipment, [code]: { ...d.equipment[code], ...patch } } }))}
            onAdd={(item) => update((d) => ({ ...d, equipment: { ...d.equipment, [item.code]: { name: item.name, unit: item.unit as any, unitPriceYen: item.value } } }))}
            onDelete={(code) => update((d) => { const next = { ...d.equipment }; delete (next as any)[code]; return { ...d, equipment: next }; })}
          />
        )}

        {tab === "consumables" && (
          <RateTable
            title="消耗品"
            rows={Object.entries(rs.data.consumables).map(([code, v]) => ({ code, name: v.name, unit: v.unit, value: v.unitPriceYen }))}
            onChange={(code, value) => update((d) => ({ ...d, consumables: { ...d.consumables, [code]: { ...d.consumables[code], unitPriceYen: value } } }))}
            allowEditMeta
            onChangeMeta={(code, patch) => update((d) => ({ ...d, consumables: { ...d.consumables, [code]: { ...d.consumables[code], ...patch } } }))}
            onAdd={(item) => update((d) => ({ ...d, consumables: { ...d.consumables, [item.code]: { name: item.name, unit: item.unit as any, unitPriceYen: item.value } } }))}
            onDelete={(code) => update((d) => { const next = { ...d.consumables }; delete (next as any)[code]; return { ...d, consumables: next }; })}
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
  onAdd: (item: { code: string; name: string; unit: string; value: number }) => void;
  onDelete: (code: string) => void;
  allowEditMeta?: boolean;
  onChangeMeta?: (code: string, patch: { name?: string; unit?: string }) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("person_day");
  const [value, setValue] = useState<number>(0);

  const canAdd = code.trim().length > 0 && name.trim().length > 0;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <b>{props.title}</b>
        <span className="small">値を編集すると保存</span>
      </div>

      <div className="card" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <input className="input" placeholder="コード（例: LAB_SURVEYOR）" value={code} onChange={(e)=>setCode(e.target.value)} style={{ minWidth: 220 }} />
          <input className="input" placeholder="名称（例: 測量士補）" value={name} onChange={(e)=>setName(e.target.value)} style={{ minWidth: 200 }} />
          <select className="input" value={unit} onChange={(e)=>setUnit(e.target.value)} style={{ minWidth: 140 }}>
            <option value="person_day">person_day（人日）</option>
            <option value="day">day（日）</option>
            <option value="piece">piece（個）</option>
            <option value="can">can（本）</option>
            <option value="set">set（式）</option>
            <option value="time">time（回）</option>
          </select>
          <input className="input" type="number" min={0} step={1} value={value} onChange={(e)=>setValue(Number(e.target.value))} style={{ width: 140 }} />
          <button className="btn" disabled={!canAdd} onClick={()=>{
            props.onAdd({ code: code.trim(), name: name.trim(), unit, value });
            setCode(""); setName(""); setValue(0);
          }}>追加</button>
          <span className="small">※ 追加はカスタム単価だけに保存</span>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 160 }}>コード</th>
            <th>名称</th>
            <th style={{ width: 140 }}>単位</th>
            <th style={{ width: 180 }}>単価（円）</th>
            <th style={{ width: 90 }} />
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r) => (
            <tr key={r.code}>
              <td className="mono">{r.code}</td>
              <td>
                {props.allowEditMeta && props.onChangeMeta ? (
                  <input className="input" value={r.name} onChange={(e)=>props.onChangeMeta!(r.code, { name: e.target.value })} />
                ) : (
                  r.name
                )}
              </td>
              <td className="mono small">
                {props.allowEditMeta && props.onChangeMeta ? (
                  <select className="input" value={r.unit} onChange={(e)=>props.onChangeMeta!(r.code, { unit: e.target.value })}>
                    <option value="person_day">person_day</option>
                    <option value="day">day</option>
                    <option value="piece">piece</option>
                    <option value="can">can</option>
                    <option value="set">set</option>
                    <option value="time">time</option>
                  </select>
                ) : (
                  r.unit
                )}
              </td>
              <td>
                <input className="input" type="number" min={0} step={1} value={r.value}
                  onChange={(e) => props.onChange(r.code, Number(e.target.value))} />
              </td>
              <td>
                <button className="btn" onClick={() => props.onDelete(r.code)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverheadTablefunction OverheadTable(props: {
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
