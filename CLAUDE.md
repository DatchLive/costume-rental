# CLAUDE.md - 社交ダンス衣装レンタル掲示板

## サービス概要

社交ダンスの衣装をユーザー同士で貸し借りできるマッチングプラットフォーム。
出品者（貸す人）と借り手（借りる人）をつなぐ掲示板型のWebサービス。

### サービスの方針

- **マッチングに特化する** — 決済機能を無理に作らずマッチングの場として割り切る
- **手数料0円** — 競合（DRECL）が5%の手数料を取る中、完全無料を差別化ポイントとして打ち出す
- **シンプルな取引フロー** — デポジット・エスクローは作らない。当事者間で自由に取引してもらう
- **配送・手渡し両対応** — 全国発送も手渡しも選択肢として設計する。社交ダンスは大会・パーティーで会う機会が多いため手渡しを考慮しつつ、遠方のユーザーのために配送も同等にサポートする

### サービスがやること

- 衣装の検索・発見
- メッセージでの交渉・日程調整（配送方法・受け渡し場所の調整を含む）
- 評価の蓄積による信頼構築

### サービスがやらないこと（初期フェーズ）

- 決済（現金・PayPayは当事者間で）
- 配送の手配・管理
- デポジット・エスクロー

---

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | Next.js 16（App Router, Turbopack） |
| バックエンド / DB | Supabase（PostgreSQL） |
| 認証 | Supabase Auth（Google OAuth + メール） |
| ストレージ | Supabase Storage（将来的にCloudflare R2へ移行） |
| スタイリング | Tailwind CSS v4 |
| バリデーション | Zod v4 + React Hook Form |
| メール通知 | Resend |
| デプロイ | Vercel |
| 決済（フェーズ2） | Stripe（プレミアムプランのサブスクのみ） |

### コーディング規約

- TypeScript を必ず使う
- Supabase の Row Level Security（RLS）を必ず設定する
- エラーハンドリングを省略しない
- コンポーネントは `app/` 配下に App Router 形式で作成する
- スタイルは Tailwind CSS を使用する

---

## DBテーブル設計

凡例: `-- ✅` 実装済み / `-- 🔄` 仕様確定済み・未実装 / `-- 🔲` フェーズ2以降

```sql
-- ユーザープロフィール
profiles (
  id uuid references auth.users primary key,  -- ✅
  name text,                                   -- ✅
  area text,                                   -- ✅ 都道府県レベル
  bio text,                                    -- ✅
  avatar_url text,                             -- ✅
  is_verified boolean default false,           -- ✅
  good_count int default 0,    -- ✅ 良かった評価の件数
  total_count int default 0,   -- ✅ 総評価件数
  plan text default 'free',    -- ✅ 'free' | 'premium'
  created_at timestamptz default now()         -- ✅
)

-- 衣装
costumes (
  id uuid primary key default gen_random_uuid(),  -- ✅
  user_id uuid references profiles(id),            -- ✅
  title text not null,                             -- ✅
  description text,                                -- ✅
  category text not null,                          -- ✅ カテゴリ参照
  height_min int,                      -- ✅ 身長下限（cm）
  height_max int,                      -- ✅ 身長上限（cm）
  rental_price int not null,           -- ✅ 円/日
  student_price int,                   -- ✅ 学生料金（任意）。表示のみ、適用確認はメッセージで当事者間が行う
  colors text[],                       -- ✅ カラー（最大2色）。選択肢は constants.ts の COSTUME_COLORS で管理
  images text[],                       -- ✅ Supabase StorageのURL配列（無料3枚・プレミアム10枚）
  area text,                           -- ✅ 都道府県
  handover_area text,                  -- ✅ 手渡し可能エリア（自由記述）
  ships_nationwide boolean default false, -- ✅ 全国配送対応
  allows_handover boolean default true,   -- ✅ 手渡し対応
  cleaning_responsibility text default 'renter_home',  -- ✅
  -- 'renter_home' → 借り手負担（ホームクリーニング可）
  -- 'renter_shop' → 借り手負担（クリーニング店）
  -- 'owner'       → オーナー負担
  -- 'other'       → その他
  cleaning_notes text,                 -- ✅ クリーニング特記事項（200文字以内）
  buffer_days int default 2,           -- ✅ 返却後〜次回貸出可能までの準備日数
  tanning_policy text default 'none',  -- ✅
  -- 'all'  → ボディファン・セルタン可
  -- 'self' → セルタンのみ可
  -- 'none' → すべて不可
  safety_pin boolean default false,    -- ✅ 安全ピン使用可能
  perfume boolean default false,       -- ✅ 香水使用可能
  status text default 'available',     -- ✅ 'available' | 'hidden'
  created_at timestamptz default now() -- ✅
)

-- レンタル申請・取引
rentals (
  id uuid primary key default gen_random_uuid(),  -- ✅
  costume_id uuid references costumes(id),         -- ✅
  renter_id uuid references profiles(id),          -- ✅
  owner_id uuid references profiles(id),           -- ✅
  use_date date not null,      -- ✅ 使用したい日
  total_price int not null,    -- ✅ 申請時点の価格で確定
  platform_fee int default 0,  -- ✅ 手数料（フェーズ1・2は0）
  status text default 'pending',  -- ✅
  -- 'pending'   → 申請中
  -- 'approved'  → 承認済み・メッセージで交渉中
  -- 'active'    → 使用中（受け渡し完了〜返却前）
  -- 'returning' → 返却確認中（借り手が返却済みボタン押下後）
  -- 'returned'  → 返却完了・クリーニング／準備中
  -- 'rejected'  → 却下
  -- 'cancelled' → キャンセル
  cancel_reason text,                              -- ✅
  created_at timestamptz default now()             -- ✅
)

-- メッセージ
messages (
  id uuid primary key default gen_random_uuid(),  -- ✅
  rental_id uuid references rentals(id),           -- ✅
  sender_id uuid references profiles(id),          -- ✅
  content text not null,                           -- ✅
  is_read boolean default false,                   -- ✅
  created_at timestamptz default now()             -- ✅
)

-- ユーザー評価（出品者・借り手の相互評価）
reviews (
  id uuid primary key default gen_random_uuid(),  -- ✅
  rental_id uuid references rentals(id),           -- ✅
  reviewer_id uuid references profiles(id),        -- ✅
  reviewee_id uuid references profiles(id),        -- ✅
  role text not null,        -- ✅ 'owner' | 'renter'
  rating text not null,      -- ✅ 'good' | 'bad'
  tags text[],               -- ✅ 選択されたタグの配列
  comment text,              -- ✅
  is_published boolean default false,  -- ✅ 双方投稿 or 7日経過で同時公開
  created_at timestamptz default now() -- ✅
)

-- 衣装評価
costume_reviews (                         -- ✅
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id),
  costume_id uuid references costumes(id),
  reviewer_id uuid references profiles(id),
  size_fit text,             -- 'small' | 'just' | 'large'
  photo_match text,          -- 'same' | 'slightly_different'
  condition text,            -- 'good' | 'normal'
  recommended_scene text[],  -- ['competition', 'party', 'demo']
  comment text,
  created_at timestamptz default now()
)

-- 通知
notifications (
  id uuid primary key default gen_random_uuid(),  -- ✅
  user_id uuid references profiles(id),            -- ✅
  type text not null,        -- ✅ 通知タイプ参照
  title text not null,       -- ✅
  body text,                 -- ✅
  link text,                 -- ✅
  is_read boolean default false,                   -- ✅
  created_at timestamptz default now()             -- ✅
)

-- お気に入り
favorites (                   -- ✅
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  costume_id uuid references costumes(id),
  created_at timestamptz default now()
)

-- 通報（フェーズ2）
reports (                     -- 🔲
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

- レンタル期間の制限なし（日程はメッセージで交渉）
- 受け渡し方法：配送 or 手渡しを出品者が設定
- 送料：配送の場合は出品者が設定（着払い・元払い・個別交渉）
- 支払い：当事者間で自由に取り決め（現金・PayPay・銀行振込等）
- サービス手数料：**無料（フェーズ1・2）**

### クリーニングルール

衣装ごとに出品者が事前に設定する。借り手は申請前に確認できる。

| 設定値 | 内容 |
|--------|------|
| 借り手負担（ホームクリーニング可） | 自宅での洗濯・手洗いでOK |
| 借り手負担（クリーニング店） | クリーニング店に出してから返却 |
| オーナー負担 | 返却後に出品者がクリーニング |
| その他 | クリーニング特記事項に詳細を記載 |

- `cleaning_notes`：200文字以内で自由記述
- `buffer_days`：クリーニング・発送準備を含む「返却後〜次の貸し出しまでの準備日数」を出品者が設定

### 取引フローとステータス遷移

```
① 借り手が申請（use_date と一言メッセージを入力）
      ↓ status: pending
② 出品者が承認 or 却下
      ↓ status: approved / rejected
③ メッセージで交渉
   - 配送 or 手渡しの確認、住所・送料・支払い方法の確認
      ↓
④ 受け渡し完了
   - 発送: 出品者「発送しました」→ 借り手「受け取りました」
   - 手渡し: 借り手「受け取りました」
      ↓ status: active
⑤ 使用
      ↓
⑥ 返却
   - 発送: 借り手「返送しました」→ 出品者「受け取りました」
   - 手渡し: 借り手「返却しました」→ 出品者「受け取りました」
      ↓ status: returning → returned
⑦ クリーニング・準備
      ↓
⑧ 出品者が「貸し出し可能にする」ボタンを押す（手動）
      ↓ costumes.status は available のまま管理
⑨ 希望日検索に再び表示される
```

### 希望日検索の仕組み（🔄 未実装）

```sql
-- 希望日と重なるrentalsが存在しない衣装だけを返す
WHERE NOT EXISTS (
  SELECT 1 FROM rentals
  WHERE rentals.costume_id = costumes.id
    AND rentals.status IN ('approved', 'active', 'returning', 'returned')
    AND rentals.use_date + costumes.buffer_days >= 希望日
)
```

`returned` 状態でも `buffer_days` 内は予約不可として扱う。

### キャンセルポリシー

| タイミング | キャンセル料 |
|-----------|------------|
| 使用日7日以上前 | 無料 |
| 使用日3〜6日前 | 取引金額の30% |
| 使用日1〜2日前 | 取引金額の50% |
| 使用日当日 | 取引金額の100% |

キャンセル料はシステムで自動徴収しない。当事者間での対応とし、利用規約に明記する。

### 収益化方針

**フェーズ2: プレミアムプラン（月額980円）**

| 項目 | 無料 | プレミアム |
|------|------|-----------|
| 衣装登録数 | 3点まで | 無制限 |
| 写真枚数 | 3枚まで | 10枚まで |
| 検索表示 | 通常 | 上位表示 |
| 認定バッジ | なし | あり |

- 課金対象は出品者のみ。借り手への課金なし
- 登録数制限はDBではなくアプリ側でチェックする（衣装登録前に件数を取得し、無料プランなら3件超でエラーを返す）

---

## 画面一覧

### 認証（✅ 実装済み）

- `/signup` — 新規登録
- `/login` — ログイン（Google / メール）
- `/reset-password` — パスワードリセット
- `/profile/edit` — プロフィール設定

### 衣装（✅ 実装済み）

- `/` — トップ / 衣装一覧（検索・絞り込み）
- `/costumes/[id]` — 衣装詳細
- `/costumes/new` — 衣装登録
- `/costumes/[id]/edit` — 衣装編集
- `/mypage/costumes` — 自分の出品一覧

### 絞り込み条件

- カテゴリ ✅
- 身長範囲 ✅（`height_min` / `height_max`）
- エリア（都道府県）✅
- 受け渡し方法（配送可 / 手渡し可）✅
- 価格帯（円/日）✅
- カラー ✅（最大2色登録・1色指定で絞り込み）
- 手渡し可能エリア（自由検索）✅
- 希望日（`use_date` と `buffer_days` で空き確認）🔄 未実装

### 取引（✅ 実装済み）

- `/rentals` — 取引一覧（借り手・出品者それぞれ）
- `/rentals/[id]` — 取引詳細・申請承認
- `/rentals/[id]/review` — 評価投稿

### メッセージ（✅ 実装済み）

- `/messages` — スレッド一覧（未読バッジ）
- `/messages/[rentalId]` — 取引ごとのチャット（Supabase Realtime）

### その他（✅ 実装済み）

- `/users/[id]` — ユーザープロフィール（評価・出品一覧）
- `/notifications` — 通知一覧
- `/mypage/favorites` — お気に入り一覧

### 静的ページ

- `/terms` ✅ / `/privacy` ✅ / `/tokushoho` ✅ / `/faq` ✅ / `/contact` ✅
- `/guide` — 使い方ガイド 🔲 未実装（リリースブロッカー）

### 管理者（🔲 フェーズ2）

- `/admin/users` / `/admin/costumes` / `/admin/reports`

---

## 通知タイプ

### 出品者向け

- `rental_requested` — レンタル申請が来た ✅（メール通知あり）
- `message_received` — メッセージが来た ✅（アプリ内のみ、メール通知 🔄 未実装）
- `rental_returned` — 返却を受け取った ✅
- `review_received` — 評価が届いた ✅
- `ready_to_list` — 準備期間が終了、貸し出し可能にするよう促す通知 🔄 未実装

### 借り手向け

- `rental_approved` — 申請が承認された ✅（メール通知あり）
- `rental_rejected` — 申請が却下された ✅（メール通知あり）
- `message_received` — メッセージが来た ✅（アプリ内のみ、メール通知 🔄 未実装）
- `review_received` — 評価が届いた ✅

---

## 評価システム

### ユーザー評価（相互評価）

- 取引完了後、双方に評価依頼を通知
- 両者が投稿 or 7日経過で同時公開（先出し不利を防ぐ設計）
- 「良かった / 残念だった」の二択 + タグ選択式
- 評価はユーザーページに「良かった件数」として表示

**出品者への評価タグ（借り手が選択）**
- 説明通りの衣装だった
- 対応が丁寧だった
- 発送・受け渡しが早かった

**借り手への評価タグ（出品者が選択）**
- 返却が丁寧だった
- 連絡が早かった
- クリーニングが丁寧だった

### 衣装評価

- タグ選択式（サイズ感・写真との一致度・コンディション・おすすめシーン）
- 借り手が `/rentals/[id]/review` でユーザー評価と同時に投稿
- 衣装詳細ページに「借りた人の声」として表示

---

## 画像アップロード仕様

### 処理フロー

```
① 画像を選択
② react-image-crop で 4:3 固定のトリミングUIを表示
③ ユーザーが位置を調整・確定
④ browser-image-compression で圧縮
⑤ Supabase Storage にアップロード
```

### 仕様

- アスペクト比: 4:3 固定
- 最大ファイルサイズ: 2MB
- 最大解像度: 2560px
- 枚数上限: 無料プラン3枚・プレミアムプラン10枚
- 圧縮はサーバーではなくブラウザ側で行う（コストゼロ）

---

## UI方針

メルカリのUIを参考にしたシンプルで直感的な設計にする。

### 申請・取引ページの設計ルール

- 現在のステータスを画面上部に大きく表示する
- 次にすべきアクションボタンを1つだけ目立たせる
- メッセージと取引操作を同一画面に配置する
- ステータスに応じてボタンの表示を切り替える
- 確認画面を挟んで誤操作を防ぐ

### ステータス別のメッセージ表示

```
借り手:
  pending   → 「承認をお待ちください」
  approved  → 「受け渡し方法をメッセージで確認してください」
  active    → 「返却の準備ができたら返却報告してください」
  returning → 「オーナーの受取確認をお待ちください」
  returned  → 「評価を投稿してください」

出品者:
  pending   → 「申請を確認して承認・却下してください」
  approved  → 「受け渡し方法をメッセージで確認してください」
  active    → 「返却をお待ちください」
  returning → 「返却を受け取ったら確認してください」
  returned  → 「クリーニング・準備が完了したら貸し出し可能にしてください」
```

---

## 実装フェーズ

### フェーズ1（初回リリース）

**実装済み ✅**
- 認証（Google OAuth + メール）
- 衣装登録・一覧・詳細・編集
- レンタル申請・承認フロー
- メッセージ機能（Supabase Realtime）
- 評価機能（ユーザー評価 + 衣装評価）
- 通知機能（アプリ内 + メール）
- ユーザープロフィールページ
- 静的ページ（利用規約・プライバシーポリシー・特定商取引法・FAQ・お問い合わせ）

**リリースブロッカー 🔲**
- `/guide` 使い方ガイド

**未実装（仕様確定済み）🔄**
- 希望日フィルタ（`use_date + buffer_days` で空き確認）
- メール通知: `message_received`（メッセージ受信時）
- メール通知: `ready_to_list`（buffer_days 経過後の貸し出し促進）

### フェーズ2

- プレミアムプラン（Stripe決済）
- 貸出カレンダー（空き状況表示）
- ブラウザプッシュ通知
- 管理者画面
- 通報・ブロック機能

### フェーズ3（要検討）

- 成約手数料
- 本人確認
- プレミアムプランの拡充

---

## 外部サービス

| サービス | 用途 | 無料枠 |
|---------|------|--------|
| Supabase | DB / Auth / Storage / Realtime | 500MB DB, 1GB Storage |
| Vercel | ホスティング | 月100GB帯域 |
| Resend | メール通知 | 月3,000通 |
| Stripe | プレミアムプラン決済（フェーズ2） | 手数料のみ |

---

## 競合分析

### DRECL（ドレクル）

- 個人間レンタル＆フリマのプラットフォーム
- システム手数料5%（キャンペーン中）
- AI試着機能あり
- デポジット制度があり取引フローが複雑

### 差別化戦略

- **手数料0円**を前面に打ち出す
- **シンプルな取引フロー**（デポジットなし）
- **配送・手渡しの両方をフラットに対応**
- AI試着はフェーズ2以降で検討
