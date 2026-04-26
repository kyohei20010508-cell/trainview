# TrainView - Claude Code Instructions

## プロジェクト概要
電車の車両ごとの混雑率を可視化するNext.js Webアプリ。

## コーディングルール
- TypeScript strict mode を使用
- コンポーネントは src/components/ に配置
- APIクライアントは src/lib/api/ に配置
- tailwindcssでスタイリング（インラインstyleは使わない）

## 主要コマンド
- 開発サーバー起動: npm run dev
- ビルド確認: npm run build
- 型チェック: npx tsc --noEmit

## APIについて
- 国交省オープンデータAPI: src/lib/api/odpt.ts を参照
- APIトークンは .env.local の ODPT_API_TOKEN から取得
- ODPT_API_TOKEN が "mock" の場合はモックデータを返す
- レート制限注意: 1秒1リクエスト以下を推奨

## 注意事項
- 車両単位データが取得できない路線は列車単位の値を全車両に適用し、UIで明示すること
- リフレッシュ間隔は NEXT_PUBLIC_REFRESH_INTERVAL で制御
