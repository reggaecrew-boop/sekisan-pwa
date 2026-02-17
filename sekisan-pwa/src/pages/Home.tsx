import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Estimate, RateSetRef } from "../types";
import { createEstimate, deleteEstimate, listEstimates } from "../features/estimates/estimateService";
import { getBaseOptions } from "../features/rateSets/rateSetService";

export default function Home() {
  const [items, setItems] = useState<Estimate[]>([]);
  const [busy, setBusy] = useState(false);
  const [baseId, setBaseId] = useState("MLIT-2026");
  const nav = useNavigate();

  const baseOptions = useMemo(() => getBaseOptions(), []);

  async function refresh() {
    setItems(await listEstimates());
  }

  useEffect(() => { refresh(); }, []);

  const onCreate = async () => {
    setBusy(true);
    try {
      const ref: RateSetRef = { type: "base", id: baseId };
      const est = await createEstimate(ref);
      await refresh();
      nav(`/estimate/${est.id}`);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("この見積を削除する？")) return;
    await deleteEstimate(id);
    await refresh();
  };

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div><b>見積一覧</b></div>
          <div className="small">見積は後から単価セットを切替できる</div>
        </div>
        <div className="row">
          <select className="input" value={baseId} onChange={(e) => setBaseId(e.target.value)}>
            {baseOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <button className="btn primary" disabled={busy} onClick={onCreate}>
            新規見積
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>更新</th>
            <th>見積名</th>
            <th>単価セット</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={4} className="small">まだ見積がない</td></tr>
          ) : (
            items.map((x) => (
              <tr key={x.id}>
                <td className="small">{x.updatedAt.slice(0,16).replace("T"," ")}</td>
                <td><Link to={`/estimate/${x.id}`}>{x.name}</Link></td>
                <td className="mono small">{x.rateSetRef.type}:{x.rateSetRef.id}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn danger" onClick={() => onDelete(x.id)}>削除</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
