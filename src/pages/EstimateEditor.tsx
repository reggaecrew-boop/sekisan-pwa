import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Estimate, EstimateLine, RateSetData, RateSetRef, WorkType } from "../types";
import { getEstimate, saveEstimate } from "../features/estimates/estimateService";
import { getBaseOptions, listCustomRateSets, resolveRateSetData } from "../features/rateSets/rateSetService";
import { calcTotals, calcLineSubtotalYen, refreshLinePricesFromRateSet, unitLabel } from "../engine/calc";

type Option = { key: string; label: string; ref: RateSetRef };

function findWorkType(est: Estimate, id: string) {
  return est.workTypes.find((w) => w.id === id);
}

export default function EstimateEditor() {
  const { id } = useParams();
  const [est, setEst] = useState<Estimate | null>(null);
  const [status, setStatus] = useState<string>("");
  const [rateData, setRateData] = useState<RateSetData | null>(null);

  const baseOptions = useMemo(() => getBaseOptions(), []);
  const [rateOptions, setRateOptions] = useState<Option[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");

  const [activeWorkTypeId, setActiveWorkTypeId] = useState<string>("");

  async function refresh() {
    if (!id) return;
    const e = await getEstimate(id);
    if (!e) { setStatus("見積が見つからない"); return; }
    setEst(e);

    const customs = await listCustomRateSets();
    const opts: Option[] = [
      ...baseOptions.map((o) => ({ key: `base:${o.id}`, label: `公表: ${o.label}`, ref: { type: "base", id: o.id } as RateSetRef })),
      ...customs.map((c) => ({ key: `custom:${c.id}`, label: `カスタム: ${c.name}`, ref: { type: "custom", id: c.id } as RateSetRef })),
    ];
    setRateOptions(opts);
    setSelectedKey(`${e.rateSetRef.type}:${e.rateSetRef.id}`);

    const first = e.workTypes?.slice().sort((a,b)=>a.order-b.order)[0];
    setActiveWorkTypeId(first?.id ?? "");
  }

  useEffect(() => { refresh(); }, [id]);

  async function loadRates(ref: RateSetRef) {
    const data = await resolveRateSetData(ref);
    setRateData(data);
  }

  useEffect(() => {
    if (!est) return;
    loadRates(est.rateSetRef).catch((e) => setStatus(String(e?.message ?? e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [est?.rateSetRef]);

  const totals = useMemo(() => (est ? calcTotals(est) : null), [est]);

  const persist = async (next: Estimate) => {
    setEst(next);
    await saveEstimate(next);
    setStatus("保存した");
  };

  const onSaveName = async (name: string) => {
    if (!est) return;
    await persist({ ...est, name });
  };

  const onChangeRateSet = async (key: string) => {
    if (!est) return;
    const opt = rateOptions.find((o) => o.key === key);
    if (!opt) return;
    setSelectedKey(key);

    // 切替後、明細の単価を新しい単価セットに寄せる（上書き行は保持）
    const data = await resolveRateSetData(opt.ref);
    const refreshed = refreshLinePricesFromRateSet({ ...est, rateSetRef: opt.ref }, data);
    setRateData(data);
    await persist(refreshed);
  };

  const addWorkType = async () => {
    if (!est) return;
    const name = prompt("工種名を入力（例: 基準点測量）")?.trim();
    if (!name) return;
    const order = (est.workTypes?.reduce((m, w) => Math.max(m, w.order), -1) ?? -1) + 1;
    const wt: WorkType = { id: crypto.randomUUID(), name, order };
    const next = { ...est, workTypes: [...est.workTypes, wt] };
    setActiveWorkTypeId(wt.id);
    await persist(next);
  };

  const deleteWorkType = async (workTypeId: string) => {
    if (!est) return;
    const wt = findWorkType(est, workTypeId);
    if (!wt) return;
    if (!confirm(`工種「${wt.name}」を削除する？（中の明細も消える）`)) return;
    const nextWorkTypes = est.workTypes.filter((w) => w.id !== workTypeId);
    const nextLines = est.lines.filter((l) => l.workTypeId !== workTypeId);
    const next = { ...est, workTypes: nextWorkTypes, lines: nextLines };
    setActiveWorkTypeId(nextWorkTypes.sort((a,b)=>a.order-b.order)[0]?.id ?? "");
    await persist(next);
  };

  const addLine = async (category: "labor"|"equipment"|"consumables") => {
    if (!est || !rateData) return;
    if (!activeWorkTypeId) return;

    const pool = Object.entries((rateData as any)[category] ?? {});
    if (pool.length === 0) { alert("このカテゴリに項目が無い"); return; }

    const key = prompt(`追加するキーを入力\n例: ${pool.slice(0,6).map(([k])=>k).join(", ")}`)?.trim();
    if (!key) return;
    const item = (rateData as any)[category]?.[key];
    if (!item) { alert("そのキーが見つからない"); return; }

    const qtyStr = prompt(`数量を入力（${unitLabel(item.unit)}）`, "1") ?? "1";
    const qty = Number(qtyStr);
    if (!Number.isFinite(qty)) return;

    const line: EstimateLine = {
      id: crypto.randomUUID(),
      workTypeId: activeWorkTypeId,
      category,
      key,
      name: item.name,
      unit: item.unit,
      qty,
      unitPriceYen: item.unitPriceYen,
      isUnitPriceOverridden: false,
    };

    await persist({ ...est, lines: [...est.lines, line] });
  };

  const updateLine = async (lineId: string, patch: Partial<EstimateLine>) => {
    if (!est) return;
    const nextLines = est.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l));
    await persist({ ...est, lines: nextLines });
  };

  const deleteLine = async (lineId: string) => {
    if (!est) return;
    await persist({ ...est, lines: est.lines.filter((l) => l.id !== lineId) });
  };

  const setOverheadMode = async (mode: "rate" | "yen") => {
    if (!est) return;
    const next = mode === "rate" ? { mode: "rate", rate: 0 } : { mode: "yen", yen: 0 };
    await persist({ ...est, overhead: next });
  };

  if (!est) return <div className="card">{status || "読み込み中…"}</div>;

  const sortedWorkTypes = est.workTypes.slice().sort((a, b) => a.order - b.order);
  const activeWT = sortedWorkTypes.find((w) => w.id === activeWorkTypeId) ?? sortedWorkTypes[0];

  const linesForActive = est.lines.filter((l) => l.workTypeId === (activeWT?.id ?? ""));
  const group = (cat: "labor"|"equipment"|"consumables") => linesForActive.filter((l) => l.category === cat);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card" style={{ display: "grid", gap: 10 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div><b>見積</b></div>
            <div className="small mono">{est.id}</div>
          </div>
          <div className="hstack">
            <Link className="btn" to="/">一覧へ</Link>
            <Link className="btn" to="/ratesets">単価セット</Link>
          </div>
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <label className="small">見積名</label>
          <input className="input" style={{ minWidth: 280 }} value={est.name} onChange={(e) => onSaveName(e.target.value)} />
          <span className="small">{status}</span>
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <label className="small">単価セット</label>
          <select className="input" value={selectedKey} onChange={(e) => onChangeRateSet(e.target.value)} style={{ minWidth: 320 }}>
            {rateOptions.map((o) => (<option key={o.key} value={o.key}>{o.label}</option>))}
          </select>
          <span className="small mono">{est.rateSetRef.type}:{est.rateSetRef.id}</span>
        </div>
      </div>

      <div className="grid2">
        <div className="card" style={{ display: "grid", gap: 10 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <b>工種</b>
            <button className="btn" onClick={addWorkType}>+ 追加</button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {sortedWorkTypes.map((w) => (
              <div key={w.id} className={"row"} style={{ justifyContent: "space-between" }}>
                <button className={"btn" + ((activeWT?.id === w.id) ? " active" : "")} onClick={() => setActiveWorkTypeId(w.id)}>
                  {w.name}
                </button>
                <button className="btn" onClick={() => deleteWorkType(w.id)}>削除</button>
              </div>
            ))}
          </div>

          <div className="small">※ 工種ごとに明細（労務/損料/消耗品）を積む</div>
        </div>

        <div className="card" style={{ display: "grid", gap: 10 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <b>内訳（{activeWT?.name ?? ""}）</b>
            <span className="small">数量×単価＝小計</span>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => addLine("labor")}>+ 労務</button>
            <button className="btn" onClick={() => addLine("equipment")}>+ 損料</button>
            <button className="btn" onClick={() => addLine("consumables")}>+ 消耗品</button>
          </div>

          <Section title="労務">
            <LineTable rows={group("labor")} onUpdate={updateLine} onDelete={deleteLine} />
          </Section>

          <Section title="損料">
            <LineTable rows={group("equipment")} onUpdate={updateLine} onDelete={deleteLine} />
          </Section>

          <Section title="消耗品">
            <LineTable rows={group("consumables")} onUpdate={updateLine} onDelete={deleteLine} />
          </Section>

          <div className="hr" />

          <div style={{ display: "grid", gap: 8 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <b>諸経費</b>
              <div className="hstack">
                <button className={"btn" + (est.overhead.mode === "rate" ? " active" : "")} onClick={() => setOverheadMode("rate")}>率</button>
                <button className={"btn" + (est.overhead.mode === "yen" ? " active" : "")} onClick={() => setOverheadMode("yen")}>定額</button>
              </div>
            </div>
            {est.overhead.mode === "rate" ? (
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="small">率（例: 0.25 = 25%）</span>
                <input className="input" type="number" step={0.01} value={est.overhead.rate}
                  onChange={(e) => persist({ ...est, overhead: { mode: "rate", rate: Number(e.target.value) } })} style={{ width: 160 }} />
                <span className="small">諸経費額: <b>{totals ? totals.overhead.toLocaleString() : 0}</b> 円</span>
              </div>
            ) : (
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="small">定額（円）</span>
                <input className="input" type="number" step={1} value={est.overhead.yen}
                  onChange={(e) => persist({ ...est, overhead: { mode: "yen", yen: Number(e.target.value) } })} style={{ width: 160 }} />
              </div>
            )}
          </div>

          <div className="hr" />

          {totals && (
            <div style={{ display: "grid", gap: 6 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>労務小計</span><b>{totals.labor.toLocaleString()} 円</b>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>損料小計</span><b>{totals.equipment.toLocaleString()} 円</b>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>消耗品小計</span><b>{totals.consumables.toLocaleString()} 円</b>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>小計</span><b>{totals.baseSubtotal.toLocaleString()} 円</b>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>諸経費</span><b>{totals.overhead.toLocaleString()} 円</b>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span><b>見積総額</b></span><b style={{ fontSize: 18 }}>{totals.grandTotal.toLocaleString()} 円</b>
              </div>
            </div>
          )}

          <div className="small">※ 単価セット切替で、上書きしていない行の単価は自動更新</div>
        </div>
      </div>
    </div>
  );
}

function Section(props: { title: string; children: any }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <b>{props.title}</b>
      </div>
      {props.children}
    </div>
  );
}

function LineTable(props: {
  rows: EstimateLine[];
  onUpdate: (id: string, patch: Partial<EstimateLine>) => void;
  onDelete: (id: string) => void;
}) {
  if (props.rows.length === 0) return <div className="small">（まだない）</div>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>項目</th>
          <th style={{ width: 90 }}>数量</th>
          <th style={{ width: 90 }}>単位</th>
          <th style={{ width: 150 }}>単価（円）</th>
          <th style={{ width: 150 }}>小計（円）</th>
          <th style={{ width: 90 }} />
        </tr>
      </thead>
      <tbody>
        {props.rows.map((r) => (
          <tr key={r.id}>
            <td>
              <div><b>{r.name}</b></div>
              <div className="small mono">{r.key}</div>
            </td>
            <td>
              <input className="input" type="number" step={0.1} value={r.qty}
                onChange={(e) => props.onUpdate(r.id, { qty: Number(e.target.value) })} />
            </td>
            <td className="mono small">{unitLabel(r.unit)}</td>
            <td>
              <input className="input" type="number" step={1} value={r.unitPriceYen}
                onChange={(e) => props.onUpdate(r.id, { unitPriceYen: Number(e.target.value), isUnitPriceOverridden: true })} />
              {r.isUnitPriceOverridden && (
                <div className="small">上書き中</div>
              )}
            </td>
            <td className="mono">{calcLineSubtotalYen(r.qty, r.unitPriceYen).toLocaleString()}</td>
            <td><button className="btn" onClick={() => props.onDelete(r.id)}>削除</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
