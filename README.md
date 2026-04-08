# 社交ダンス衣装レンタル
社交ダンスの衣装をユーザー同士で貸し借りできるマッチングプラットフォーム。
出品者（貸す人）と借り手（借りる人）をつなぐ掲示板型のWebアプリケーション。

## URL
[https://ballroom-costume.com](https://ballroom-costume.com)

## 主な機能
- 衣装の検索・絞り込み・詳細閲覧
- レンタル申請・承認フロー
- リアルタイムメッセージ
- 相互評価システム（ユーザー評価・衣装評価）
- アプリ内通知 + メール通知
- お気に入り機能

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| バックエンド / DB | Supabase (PostgreSQL) |
| 認証 | Supabase Auth（Google OAuth + メール） |
| リアルタイム通信 | Supabase Realtime |
| ストレージ | Supabase Storage |
| メール送信 | Resend |
| フォーム | React Hook Form + Zod |
| デプロイ | Vercel |

## 技術的なポイント

### フルスタック開発
Next.js App Router を採用し、Server Components / Client Components を使い分け。API Routes でメール送信・通知処理を実装。フロントエンドからバックエンドまで一貫して TypeScript で開発。

### 認証・セキュリティ
Supabase Auth による Google OAuth + メール認証を実装。全テーブルに Row Level Security (RLS) ポリシーを設定し、他ユーザーのデータへの不正アクセスをDB層で防止。

### リアルタイムチャット機能
Supabase Realtime を活用したチャット機能を実装。メッセージ送信と同時に相手の画面へリアルタイム反映。

### 型安全な開発
Supabase CLI でDBスキーマから TypeScript型を自動生成（`supabase gen types`）。Zod によるスキーマバリデーションと React Hook Form を組み合わせ、入力値の型安全をフロントエンドからDB操作まで一貫して確保。

### 画像処理パイプライン
`react-image-crop` による 4:3 固定トリミング UI と `browser-image-compression` によるブラウザ側圧縮（最大2MB・2560px）をパイプライン化。サーバーリソースを使わずに画像最適化を実現。

### マイグレーション管理
Supabase CLI による SQLマイグレーション管理。スキーマ変更を履歴として管理し、本番環境へのデプロイを安全に行う運用フローを構築。

### メール通知設計
Resend を使用したトランザクショナルメール。取引ステータスの変化（申請・承認・却下・発送・返却）に応じて関係者へ自動送信。HTML テンプレートを分離して管理。

## 画面一覧

| パス | 内容 |
|------|------|
| `/` | 衣装一覧（カテゴリ・身長・エリア・価格・カラー等で絞り込み） |
| `/costumes/[id]` | 衣装詳細・レンタル申請 |
| `/costumes/new` | 衣装登録（画像トリミング・圧縮） |
| `/rentals/[id]` | 取引詳細・ステータス管理 |
| `/messages/[rentalId]` | リアルタイムチャット |
| `/users/[id]` | ユーザープロフィール・評価一覧 |
| `/notifications` | 通知一覧 |
| `/mypage/favorites` | お気に入り一覧 |