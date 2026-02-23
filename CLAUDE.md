# CLAUDE.md - 社交ダンス衣装レンタル掲示板

## サービス概要

社交ダンスの衣装をユーザー同士で貸し借りできるマッチングプラットフォーム。
出品者（貸す人）と借り手（借りる人）をつなぐ掲示板型のサービス。

---

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | Next.js（App Router） |
| バックエンド / DB | Supabase（PostgreSQL） |
| 認証 | Supabase Auth（Google + メール） |
| ストレージ | Supabase Storage（将来的にCloudflare R2へ移行） |
| デプロイ | Vercel |
| メール通知 | Resend |
| 決済（フェーズ3） | Stripe Connect |

### コーディングルール

- TypeScriptを必ず使う
- SupabaseのRow Level Security（RLS）を必ず設定する
- エラーハンドリングを省略しない
- コンポーネントはapp/配下にApp Router形式で作成する
- スタイルはTailwind CSSを使用する

---

## DBテーブル設計

```sql
-- ユーザープロフィール
profiles (
  id uuid references auth.users primary key,
  name text,
  area text,              -- 都道府県レベル
  bio text,
  avatar_url text,
  is_verified boolean default false,
  rating_avg numeric,
  rating_count int default 0,
  plan text default 'free', -- 'free' | 'premium'
  created_at timestamptz default now()
)

-- 衣装
costumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  title text not null,
  description text,
  category text not null,   -- カテゴリ参照
  size text,
  price_per_day int not null,  -- 円/日
  images text[],               -- Supabase StorageのURL配列（最大10枚）
  area text,
  ships_nationwide boolean default false,
  min_rental_days int default 2,
  max_rental_days int default 14,
  status text default 'available', -- 'available' | 'renting' | 'hidden'
  created_at timestamptz default now()
)

-- レンタル申請・取引
rentals (
  id uuid primary key default gen_random_uuid(),
  costume_id uuid references costumes(id),
  renter_id uuid references profiles(id),
  owner_id uuid references profiles(id),
  start_date date not null,
  end_date date not null,
  total_price int not null,
  platform_fee int not null,   -- 手数料（将来実装）
  status text default 'pending',
  -- 'pending' | 'approved' | 'rejected' | 'active' | 'returned' | 'cancelled'
  cancel_reason text,
  created_at timestamptz default now()
)

-- メッセージ
messages (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id),
  sender_id uuid references profiles(id),
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
)

-- 評価
reviews (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id),
  reviewer_id uuid references profiles(id),
  reviewee_id uuid references profiles(id),
  role text not null,        -- 'owner' | 'renter'
  rating int not null,       -- 1〜5
  accuracy_rating int,       -- 出品者向け: 商品説明の正確さ
  response_rating int,       -- 出品者向け: 対応の丁寧さ
  return_rating int,         -- 借り手向け: 返却の丁寧さ・期限遵守
  comment text,
  is_published boolean default false,  -- 双方投稿 or 7日経過で公開
  created_at timestamptz default now()
)

-- 通知
notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text not null,        -- 通知タイプ参照
  title text not null,
  body text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
)

-- お気に入り
favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  costume_id uuid references costumes(id),
  created_at timestamptz default now()
)

-- 通報
reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  target_user_id uuid references profiles(id),
  target_costume_id uuid references costumes(id),
  reason text not null,
  status text default 'pending', -- 'pending' | 'resolved' | 'dismissed'
  created_at timestamptz default now()
)
```

---

## 衣装カテゴリ

- ラテン（女性）
- ラテン（男性）
- スタンダード（女性）
- スタンダード（男性）
- 練習着
- アクセサリー・小物
- その他

---

## ビジネスルール

### レンタルルール

- 最短レンタル期間：2泊3日
- 最長レンタル期間：14日間
- 送料：出品者が設定（個別交渉 or 全国発送対応）

### キャンセルポリシー

| タイミング | キャンセル料 |
|-----------|------------|
| 開始日7日以上前 | 無料 |
| 開始日3〜6日前 | 取引金額の30% |
| 開始日1〜2日前 | 取引金額の50% |
| 開始日当日 | 取引金額の100% |

### 手数料（フェーズ3で実装）

- 成約手数料：取引金額の10%
- 負担：出品者から徴収
- 決済：Stripe Connect（エスクロー型）

### プレミアムプラン（フェーズ2で実装）

| 項目 | 無料 | プレミアム（月額980円） |
|------|------|----------------------|
| 衣装登録数 | 3点まで | 無制限 |
| 写真枚数 | 3枚まで | 10枚まで |
| 検索表示 | 通常 | 上位表示 |
| 認定バッジ | なし | あり |

※ 課金対象は出品者のみ。借り手への課金なし。

### 破損・紛失ルール

- サービス内取引のトラブルのみ運営が仲裁対応
- サービス外でのやり取りによるトラブルは対応不可（利用規約に明記）
- 破損・紛失の場合は当事者間で交渉、運営はメッセージ記録を元に仲裁

---

## 画面一覧

### 認証

- `/signup` - 新規登録
- `/login` - ログイン（Google / メール）
- `/reset-password` - パスワードリセット
- `/profile/edit` - プロフィール設定

### 衣装

- `/` - トップ / 衣装一覧（検索・絞り込み）
- `/costumes/[id]` - 衣装詳細
- `/costumes/new` - 衣装登録
- `/costumes/[id]/edit` - 衣装編集
- `/mypage/costumes` - 自分の出品一覧

### 絞り込み条件

- カテゴリ
- サイズ
- エリア（都道府県）
- 価格帯（円/日）
- 全国発送対応

### 取引

- `/rentals` - 取引一覧（借り手・出品者それぞれ）
- `/rentals/[id]` - 取引詳細・申請承認
- `/rentals/[id]/review` - 評価投稿

### メッセージ

- `/messages` - スレッド一覧（未読バッジ）
- `/messages/[rentalId]` - 取引ごとのチャット

### ユーザー

- `/users/[id]` - ユーザープロフィール（評価・出品一覧）

### 通知

- `/notifications` - 通知一覧

### お気に入り

- `/mypage/favorites` - お気に入り一覧

### 管理者

- `/admin/users` - ユーザー管理
- `/admin/costumes` - 衣装モデレーション
- `/admin/reports` - 通報対応

### 静的ページ（初回リリース必須）

- `/terms` - 利用規約
- `/privacy` - プライバシーポリシー
- `/tokushoho` - 特定商取引法に基づく表記
- `/faq` - よくある質問
- `/contact` - お問い合わせ

---

## 通知タイプ

### 出品者向け

- `rental_requested` - レンタル申請が来た
- `message_received` - メッセージが来た
- `rental_returned` - 返却完了報告が来た
- `review_received` - 評価が届いた

### 借り手向け

- `rental_approved` - 申請が承認された
- `rental_rejected` - 申請が却下された
- `message_received` - メッセージが来た
- `review_received` - 評価が届いた

### 共通

- `return_reminder` - 返却期限リマインダー（前日・当日）

---

## 評価システム

- 取引完了後、双方に評価依頼を通知
- 両者が投稿 or 7日経過で同時公開（先出し不利を防ぐ）
- 評価はユーザーページに累積表示

---

## 禁止事項（利用規約に明記）

- 衣装以外の物品の出品
- 転売目的の利用
- プラットフォーム外での取引誘導（LINE ID等の掲載）
- なりすまし・虚偽情報の登録
- 嫌がらせ・誹謗中傷

---

## 実装フェーズ

### フェーズ1（初回リリース）

- 認証（Google + メール）
- 衣装登録・一覧・詳細
- レンタル申請・承認フロー
- メッセージ機能（Supabase Realtime）
- 評価機能
- メール通知（Resend）
- アプリ内通知
- 利用規約・特商法等の静的ページ

### フェーズ2

- お気に入り機能
- 貸出カレンダー（空き状況表示）
- ブラウザプッシュ通知
- 管理者画面
- 通報・ブロック機能
- プレミアムプラン（登録数制限 + Stripe）

### フェーズ3（収益化）

- Stripe Connectで成約手数料
- 本人確認
- プレミアムプランの拡充

---

## 外部サービス一覧

| サービス | 用途 | 無料枠 |
|---------|------|--------|
| Supabase | DB / Auth / Storage | 500MB DB, 1GB Storage |
| Vercel | ホスティング | 月100GB帯域 |
| Resend | メール通知 | 月3,000通 |
| Stripe | 決済（フェーズ3） | 手数料のみ |