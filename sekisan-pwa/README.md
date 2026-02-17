# sekisan-pwa（GitHub Pages / 端末内保存）

- GitHub Pages で動作（Vite + React + TypeScript）
- ルーティングは HashRouter（Pagesでのリロード404回避）
- 単価は「公表単価（2026同梱）」から **丸ごとコピー**して「カスタム単価セット（フル編集）」を作成
- データは端末内（IndexedDB/Dexie）に保存（共有・サーバ保存なし）

## セットアップ（Codespaces/ローカル）
```bash
npm i
npm run dev
```

## GitHub Pages 公開
1. Repository を Public（GitHub Free の場合）
2. Settings → Pages → Source: GitHub Actions
3. main に push → Actions が走って公開

公開URL例: `https://<user>.github.io/sekisan-pwa/`

## 画面
- 見積一覧：見積作成/削除（簡易）
- 見積編集：単価セット選択（公表/カスタム）＋後から切替可能
- 単価セット：カスタム単価セット一覧/作成（公表からコピー）
- 単価編集：労務/損料/消耗品/諸経費（タブ）

## 公表単価データ（同梱）
`src/rates/baseCatalog2026.ts` に 2026 の雛形が入っています。
現時点はサンプル項目のみ。項目/単価はここに追記していく運用です。
