import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import EstimateEditor from "./pages/EstimateEditor";
import RateSets from "./pages/RateSets";
import RateSetEditor from "./pages/RateSetEditor";

export default function App() {
  return (
    <div className="container">
      <header className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div className="hstack">
          <b>積算PWA</b>
          <span className="small">（単価セット：公表→丸ごとコピー→フル編集）</span>
        </div>
        <nav className="hstack">
          <Link className="btn" to="/">見積</Link>
          <Link className="btn" to="/ratesets">単価セット</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estimate/:id" element={<EstimateEditor />} />
        <Route path="/ratesets" element={<RateSets />} />
        <Route path="/ratesets/:id" element={<RateSetEditor />} />
      </Routes>

      <footer className="small" style={{ marginTop: 16, opacity: 0.8 }}>
        データは端末内（IndexedDB）に保存。GitHub Pagesはアプリ配布のみ。
      </footer>
    </div>
  );
}
