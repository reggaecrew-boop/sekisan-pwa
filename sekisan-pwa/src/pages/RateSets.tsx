import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CustomRateSet } from "../types";
import { createCustomFromBase, deleteCustomRateSet, getBaseOptions, listCustomRateSets, saveCustomRateSet } from "../features/rateSets/rateSetService";

export default function RateSets() {
  const baseOptions = useMemo(() => getBaseOptions(), []);
  const [baseId, setBaseId] = useState("MLIT-2026");
  const [name, setName] = useState("");
  const [items, setItems] = useState<CustomRateSet[]>([]);
  const [status, setStatus] = useState("");
  const nav = useNavigate();

  async function refresh() { setItems(await listCustomRateSets()); }
  useEffect(() => { refresh(); }, []);

  const onCreate = async () => {
    const rs = createCustomFromBase(baseId, name || `カスタム単価（${baseId}コピー）`);
    await saveCustomRateSet(rs);
    setName("");
    setStatus("作成した");
    await refresh();
    nav(`/ratesets/${rs.id}`);
  };

  const onDelete = async (id: string) => {
    if (!confirm("このカスタム単価セットを削除する？")) return;
    await deleteCustomRateSet(id);
    await refresh();
  };

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div><b>単価セット</b></div>
          <div className="small">公表単価（2026）から丸ごとコピーしてカスタムを作る</div>
        </div>
        <div className="small">{status}</div>
      </div>

      <div className="card" style={{ background: "#fafafa" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <label className="small">作成元（公表）</label>
            <select className="input" value={baseId} onChange={(e) => setBaseId(e.target.value)}>
              {baseOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="row">
            <label className="small">名前</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="会社標準2026 など" />
            <button className="btn primary" onClick={onCreate}>カスタム作成</button>
          </div>
        </div>
        <div className="small" style={{ marginTop: 6 }}>※ カスタムはフル編集（ベースの完全コピー）</div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>更新</th>
            <th>カスタム名</th>
            <th>作成元</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={4} className="small">まだカスタム単価セットがない</td></tr>
          ) : items.map((x) => (
            <tr key={x.id}>
              <td className="small">{x.updatedAt.slice(0,16).replace("T"," ")}</td>
              <td><Link to={`/ratesets/${x.id}`}>{x.name}</Link></td>
              <td className="mono small">{x.originBaseSetId}</td>
              <td style={{ textAlign: "right" }}>
                <button className="btn danger" onClick={() => onDelete(x.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="small">
        公表単価の雛形は <span className="mono">src/rates/baseCatalog2026.ts</span>
      </div>
    </div>
  );
}
