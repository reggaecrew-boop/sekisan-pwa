import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Estimate, RateSetRef } from "../types";
import { getEstimate, saveEstimate } from "../features/estimates/estimateService";
import { getBaseOptions, listCustomRateSets, resolveRateSetData } from "../features/rateSets/rateSetService";
import { calcSampleLaborTotalYen } from "../engine/calc";

type Option = { key: string; label: string; ref: RateSetRef };

export default function EstimateEditor() {
  const { id } = useParams();
  const [est, setEst] = useState<Estimate | null>(null);
  const [status, setStatus] = useState<string>("");
  const [personDays, setPersonDays] = useState<number>(1);
  const [sampleTotal, setSampleTotal] = useState<number>(0);

  const baseOptions = useMemo(() => getBaseOptions(), []);
  const [rateOptions, setRateOptions] = useState<Option[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");

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
  }

  useEffect(() => { refresh(); }, [id]);

  async function recompute(ref: RateSetRef) {
    const data = await resolveRateSetData(ref);
    setSampleTotal(calcSampleLaborTotalYen(data, personDays));
  }

  useEffect(() => {
    if (!est) return;
    recompute(est.rateSetRef).catch((e) => setStatus(String(e?.message ?? e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [est?.rateSetRef, personDays]);

  const onSaveName = async (name: string) => {
    if (!est) return;
    const next = { ...est, name };
    setEst(next);
    await saveEstimate(next);
    setStatus("保存した");
  };

  const onChangeRateSet = async (key: string) => {
    if (!est) return;
    const opt = rateOptions.find((o) => o.key === key);
    if (!opt) return;
    const next = { ...est, rateSetRef: opt.ref };
    setEst(next);
    setSelectedKey(key);
    await saveEstimate(next);
    await recompute(opt.ref);
    setStatus("単価セットを切替した");
  };

  if (!est) return <div className="card">{status || "読み込み中…"}</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card" style={{ display: "grid", gap: 10 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div><b>見積編集</b></div>
            <div className="small mono">{est.id}</div>
          </div>
          <div className="hstack">
            <Link className="btn" to="/ratesets">単価セット管理へ</Link>
          </div>
        </div>

        <div className="row">
          <label className="small">見積名</label>
          <input className="input" style={{ minWidth: 260 }} value={est.name} onChange={(e) => onSaveName(e.target.value)} />
          <span className="small">{status}</span>
        </div>

        <div className="row">
          <label className="small">単価セット</label>
          <select className="input" value={selectedKey} onChange={(e) => onChangeRateSet(e.target.value)}>
            {rateOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <span className="small mono">適用: {est.rateSetRef.type}:{est.rateSetRef.id}</span>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 10 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div><b>サンプル計算</b></div>
            <div className="small">例として「測量士(SURVEYOR)」の人日×単価だけ計算</div>
          </div>
          <div className="row">
            <label className="small">人日</label>
            <input className="input" type="number" min={0} step={0.5} value={personDays} onChange={(e) => setPersonDays(Number(e.target.value))} />
          </div>
        </div>

        <div className="row">
          <div className="small">合計（円）</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{sampleTotal.toLocaleString()}</div>
        </div>

        <div className="small">※ 明細/積み上げは今後拡張。単価切替が効くことの確認用。</div>
      </div>
    </div>
  );
}
