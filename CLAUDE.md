# CLAUDE.md - 社交ダンス衣装レンタル掲示板

## サービス概要

社交ダンスの衣装をユーザー同士で貸し借りできるマッチングプラットフォーム。
出品者（貸す人）と借り手（借りる人）をつなぐ掲示板型のサービス。

### サービスの方針

- **マッチングに特化する** - 決済機能を無理に作らずマッチングの場として割り切る
- **手数料0円** - 競合（DRECL）が5%の手数料を取っているため、完全無料を差別化ポイントとして打ち出す
- **シンプルな取引フロー** - デポジット・エスクローは作らない。当事者間で自由に取引してもらう
- **配送・手渡しの両方に対応** - 全国発送も手渡しも選択肢として設計する。社交ダンスは大会・パーティーで会う機会が多いため手渡しを考慮しつつ、遠方のユーザーのために配送も同等にサポートする

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
| フロントエンド | Next.js（App Router） |
| バックエンド / DB | Supabase（PostgreSQL） |
| 認証 | Supabase Auth（Google + メール） |
| ストレージ | Supabase Storage（将来的にCloudflare R2へ移行） |
| デプロイ | Vercel |
| メール通知 | Resend |
| 決済（フェーズ2） | Stripe（プレミアムプランのサブスクのみ） |

### コーディングルール

- TypeScriptを必ず使う
- SupabaseのRow Level Security（RLS）を必ず設定する
- エラーハンドリングを省略しない
- コンポーネントはapp/配下にApp Router形式で作成する
- スタイルはTailwind CSSを使用する

---

## DBテーブル設計

凡例: `-- ✅` 実装済み / `-- 🔄` 仕様確定済み・未実装（要マイグレーション）/ `-- 🔲` フェーズ2以降

```sql
-- ユーザープロフィール
profiles (
  id uuid references auth.users primary key,  -- ✅
  name text,                                   -- ✅
  area text,                                   -- ✅ 都道府県レベル
  bio text,                                    -- ✅
  avatar_url text,                             -- ✅
  is_verified boolean default false,           -- ✅
  good_count int default 0,    -- 🔄 良かった評価の件数（現在: rating_avg, rating_count）
  total_count int default 0,   -- 🔄 総評価件数（現在: rating_avg, rating_count）
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
  rental_price int not null,           -- ✅ 円/日（旧: price_per_day）
  student_price int,                   -- ✅ 学生料金（任意）。表示のみ、適用確認はメッセージで当事者間が行う
  colors text[],                       -- ✅ カラー（最大2色）。選択肢は constants.ts の COSTUME_COLORS で管理
  images text[],                       -- ✅ Supabase StorageのURL配列（無料3枚・プレミアム10枚）
  area text,                           -- ✅ 都道府県
  handover_area text,                  -- 🔄 手渡し可能エリア（自由記述）
  ships_nationwide boolean default false, -- ✅ 全国配送対応
  allows_handover boolean default true,   -- ✅ 手渡し対応（仕様名: accepts_handover だが実装は allows_handover）
  cleaning_responsibility text default 'renter_home',  -- 🔄
  -- 'renter_home' → 借り手負担（ホームクリーニング可）
  -- 'renter_shop' → 借り手負担（クリーニング店）
  -- 'owner'       → オーナー負担
  -- 'other'       → その他
  cleaning_notes text,                 -- 🔄 クリーニング特記事項（200文字以内）
  buffer_days int default 2,           -- 🔄 返却後〜次回貸出可能までの準備日数
  tanning_policy text default 'none',  -- 🔄（現在: certan_ok, body_foundation_ok で暫定対応）
  -- 'all'  → ボディファン・セルタン可
  -- 'self' → セルタンのみ可
  -- 'none' → すべて不可
  safety_pin boolean default false,    -- 🔄 安全ピン（背番号など）使用可能
  perfume boolean default false,       -- 🔄 香水使用可能
  status text default 'available',     -- ✅ 'available' | 'hidden'
  -- ※ 'renting' ステータスは削除予定 🔄（レンタル中かどうかはrentalsテーブルで管理）
  created_at timestamptz default now() -- ✅
)

-- レンタル申請・取引
rentals (
  id uuid primary key default gen_random_uuid(),  -- ✅
  costume_id uuid references costumes(id),         -- ✅
  renter_id uuid references profiles(id),          -- ✅
  owner_id uuid references profiles(id),           -- ✅
  use_date date not null,      -- 🔄 使用したい日（現在: start_date, end_date で実装）
  total_price int not null,    -- ✅ 申請時点の価格で確定
  platform_fee int default 0,  -- ✅ 手数料（フェーズ1・2は0）
  status text default 'pending',  -- ✅
  -- 'pending'    → 申請中（借り手が申請、出品者の承認待ち）
  -- 'approved'   → 承認済み・メッセージで交渉中
  -- 'active'     → 使用中（受け渡し完了〜返却前）
  -- 'returning'  → 返却確認中（借り手が返却済みボタン押下後）🔄 未実装
  -- 'returned'   → 返却完了・クリーニング／準備中
  -- 'rejected'   → 却下
  -- 'cancelled'  → キャンセル
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
  rating text not null,      -- 🔄 'good'（良かった）| 'bad'（残念だった）（現在: int 1〜5の星評価）
  tags text[],               -- 🔄 選択されたタグの配列（現在: accuracy_rating等のint）
  comment text,              -- ✅
  is_published boolean default false,  -- ✅ 双方投稿 or 7日経過で同時公開
  created_at timestamptz default now() -- ✅
)

-- 衣装評価（フェーズ2で実装）
costume_reviews (                         -- 🔲
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

-- お気に入り（フェーズ2）
favorites (                   -- 🔲
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
- 受け渡し方法：配送 or 手渡しを出品者が設定。どちらも対応可にすることを推奨
- 送料：配送の場合は出品者が設定（着払い・元払い・個別交渉）
- 支払い：当事者間で自由に取り決め（現金・PayPay・銀行振込等）
- サービス手数料：**無料（フェーズ1・2）**

### クリーニングルール 🔄 未実装

衣装ごとに出品者が事前に設定する。借り手は申請前に確認できる。

| 設定値 | 内容 |
|--------|------|
| 借り手負担（ホームクリーニング可） | 自宅での洗濯・手洗いでOK |
| 借り手負担（クリーニング店） | クリーニング店に出してから返却 |
| オーナー負担 | 返却後に出品者がクリーニング |
| その他 | クリーニング特記事項に詳細を記載 |

- クリーニング特記事項：200文字以内で自由記述（例: ホームクリーニング時はネット使用）
- buffer_days：クリーニング・発送準備を含む「返却後〜次の貸し出しまでの準備日数」を出品者が設定

### 取引フローとstatusの遷移

```
① 借り手が申請（use_dateと一言メッセージを入力）🔄 現在は start_date/end_date
      ↓ status: pending ✅
② 出品者が承認 or 却下
      ↓ status: approved（承認）/ rejected（却下）✅
③ メッセージで交渉
   - 発送 or 手渡しの確認
   - 発送の場合: 住所・送料・発送日
   - 手渡しの場合: 場所・日時
   - 支払い方法の確認
   - クリーニング担当の最終確認（設定と異なる場合）
      ↓
④ 受け渡し完了
   - 発送: 出品者「発送しました」→ 借り手「受け取りました」
   - 手渡し: 借り手「受け取りました」
      ↓ status: active ✅
⑤ 使用
      ↓
⑥ 返却
   - 発送: 借り手「返送しました」→ 出品者「受け取りました」
   - 手渡し: 借り手「返却しました」→ 出品者「受け取りました」
      ↓ status: returning 🔄 未実装 → returned ✅
⑦ クリーニング・準備
   - 借り手クリーニングの場合: 返却前に完了済み → すぐ準備へ
   - 出品者クリーニングの場合: 返却後に対応
      ↓
⑧ 出品者が「貸し出し可能にする」ボタンを押す（手動）
   ※ returned後 buffer_days 経過で「そろそろ貸し出し可能にできますか？」通知を送る 🔄
      ↓ status: returned → costumesのstatusはavailableのまま管理
⑨ 希望日検索に再び表示される
```

### 希望日検索の仕組み 🔄 未実装

```sql
-- 希望日と重なるrentalsが存在しない衣装だけを返す
WHERE NOT EXISTS (
  SELECT 1 FROM rentals
  WHERE rentals.costume_id = costumes.id
    AND rentals.status IN ('approved', 'active', 'returning', 'returned')
    AND rentals.use_date + costumes.buffer_days >= 希望日
)
```

※ returned状態でもbuffer_days内は予約不可として扱う

### キャンセルポリシー

| タイミング | キャンセル料 |
|-----------|------------|
| 使用日7日以上前 | 無料 |
| 使用日3〜6日前 | 取引金額の30% |
| 使用日1〜2日前 | 取引金額の50% |
| 使用日当日 | 取引金額の100% |

※ キャンセル料はシステムで自動徴収しない。当事者間での対応とし、利用規約に明記する。

### 収益化方針

**フェーズ2（メイン収益）: プレミアムプラン**

| 項目 | 無料 | プレミアム（月額980円） |
|------|------|----------------------|
| 衣装登録数 | 3点まで | 無制限 |
| 写真枚数 | 3枚まで | 10枚まで |
| 検索表示 | 通常 | 上位表示 |
| 認定バッジ | なし | あり |

- 課金対象は出品者のみ。借り手への課金なし
- 登録数制限はDBではなくアプリ側でチェックする
- 衣装登録前にuser_idで件数を取得し、無料プランなら3件超でエラーを返す

**フェーズ3（将来・要検討）: 成約手数料**

- 手渡し・現金払いが実態として多いため、手数料徴収は難しい可能性がある
- ユーザーの行動を見てから判断する

### 破損・紛失ルール

- サービス内取引のトラブルのみ運営が仲裁対応
- サービス外でのやり取りによるトラブルは対応不可（利用規約に明記）
- 破損・紛失の場合は当事者間で交渉、運営はメッセージ記録を元に仲裁

---

## 画面一覧

### 認証 ✅ 実装済み

- `/signup` - 新規登録
- `/login` - ログイン（Google / メール）
- `/reset-password` - パスワードリセット
- `/profile/edit` - プロフィール設定

### 衣装 ✅ 実装済み

- `/` - トップ / 衣装一覧（検索・絞り込み）
- `/costumes/[id]` - 衣装詳細
- `/costumes/new` - 衣装登録
- `/costumes/[id]/edit` - 衣装編集
- `/mypage/costumes` - 自分の出品一覧

### 絞り込み条件

- カテゴリ ✅
- 身長範囲 ✅（height_min / height_max）
- エリア（都道府県）✅
- 受け渡し方法（配送可 / 手渡し可）✅
- 価格帯（円/日）✅
- カラー ✅（最大2色登録・1色指定で絞り込み）
- 手渡し可能エリア（自由検索）🔄 未実装（handover_area フィールド追加後に対応）
- 希望日（use_dateとbuffer_daysで空き確認）🔄 未実装

### 取引 ✅ 実装済み

- `/rentals` - 取引一覧（借り手・出品者それぞれ）
- `/rentals/[id]` - 取引詳細・申請承認
- `/rentals/[id]/review` - 評価投稿

### メッセージ ✅ 実装済み

- `/messages` - スレッド一覧（未読バッジ）
- `/messages/[rentalId]` - 取引ごとのチャット（Supabase Realtime）

### ユーザー ✅ 実装済み

- `/users/[id]` - ユーザープロフィール（評価・出品一覧）

### 通知 ✅ 実装済み

- `/notifications` - 通知一覧

### お気に入り 🔲 フェーズ2

- `/mypage/favorites` - お気に入り一覧

### 管理者 🔲 フェーズ2

- `/admin/users` - ユーザー管理
- `/admin/costumes` - 衣装モデレーション
- `/admin/reports` - 通報対応

### 静的ページ

- `/terms` - 利用規約 ✅
- `/privacy` - プライバシーポリシー ✅
- `/tokushoho` - 特定商取引法に基づく表記 ✅
- `/faq` - よくある質問 ✅
- `/contact` - お問い合わせ ✅
- `/guide` - 使い方ガイド（借りる・貸す手順をタブで切り替え）🔲 未実装（リリースブロッカー）

---

## 通知タイプ

### 出品者向け

- `rental_requested` - レンタル申請が来た ✅（メール通知あり）
- `message_received` - メッセージが来た ✅（アプリ内のみ、メール通知 🔄 未実装）
- `rental_returned` - 返却を受け取った ✅
- `review_received` - 評価が届いた ✅
- `ready_to_list` - 準備期間が終了、貸し出し可能にするよう促す通知 🔄 未実装

### 借り手向け

- `rental_approved` - 申請が承認された ✅（メール通知あり）
- `rental_rejected` - 申請が却下された ✅（メール通知あり）
- `message_received` - メッセージが来た ✅（アプリ内のみ、メール通知 🔄 未実装）
- `review_received` - 評価が届いた ✅

---

## 評価システム

### ユーザー評価（相互評価）🔄 UI変更が必要

- 取引完了後、双方に評価依頼を通知 ✅
- 両者が投稿 or 7日経過で同時公開（先出し不利を防ぐ）✅
- メルカリと同じ「良かった / 残念だった」の二択 🔄（現在: 1〜5の星評価で実装）
- 評価はユーザーページに「良かった率」として表示（例: 良かった 12件）🔄（現在: 星平均で表示）

**出品者への評価タグ（借り手が選択）** 🔄 未実装（現在: accuracy_rating, response_rating のスコア）
- 説明通りの衣装だった
- 対応が丁寧だった
- 発送・受け渡しが早かった

**借り手への評価タグ（出品者が選択）** 🔄 未実装（現在: return_rating のスコア）
- 返却が丁寧だった
- 連絡が早かった
- クリーニングが丁寧だった

### 衣装評価（フェーズ2）🔲

- 星評価ではなくタグ選択式にしてネガティブ評価が出にくい設計にする
- 項目：サイズ感・写真との一致度・コンディション・おすすめシーン
- 衣装詳細ページに「借りた人の声」として表示

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

**実装済み ✅**
- 認証（Google + メール）
- 衣装登録・一覧・詳細（高さ範囲・手渡し対応・全国発送・セルタン可・ボディファンデ可）
- レンタル申請・承認フロー（start_date/end_dateで実装）
- メッセージ機能（Supabase Realtime）
- 評価機能（星評価で実装）
- 通知機能（アプリ内）
- ユーザープロフィールページ（/users/[id]）
- 静的ページ（/terms, /privacy, /tokushoho, /faq, /contact）
- メール通知（申請・承認・却下）

**リリースブロッカー 🔲**
- `/guide` 使い方ガイド（借りる・貸す手順のページ）

**仕様変更対応（コードへの反映が必要）🔄**
- costumes テーブルに新フィールド追加
  - `handover_area`（手渡し可能エリア）
  - `cleaning_responsibility`, `cleaning_notes`（クリーニング設定）
  - `buffer_days`（準備日数）
  - `tanning_policy`（certan_ok / body_foundation_ok から置き換え）
  - `safety_pin`, `perfume`
  - status から `renting` を削除
- rentals テーブル: `start_date`/`end_date` → `use_date` に変更
- rentals status に `returning` を追加
- reviews テーブル: 星評価 → 「良かった/残念だった」+ タグ方式に変更
- profiles テーブル: `rating_avg`/`rating_count` → `good_count`/`total_count` に変更
- 希望日フィルタ（use_date + buffer_days で空き確認）の実装
- メール通知: `message_received`（メッセージ受信時）
- メール通知: `ready_to_list`（buffer_days 経過後の貸し出し促進）

### フェーズ2

- お気に入り機能
- 貸出カレンダー（空き状況表示）
- ブラウザプッシュ通知
- 管理者画面
- 通報・ブロック機能
- プレミアムプラン（登録数制限 + Stripe）
- 衣装評価機能（タグ選択式）

### フェーズ3（要検討）

- 成約手数料（ユーザー行動を見て判断）
- 本人確認
- プレミアムプランの拡充

---

## 外部サービス一覧

| サービス | 用途 | 無料枠 |
|---------|------|--------|
| Supabase | DB / Auth / Storage | 500MB DB, 1GB Storage |
| Vercel | ホスティング | 月100GB帯域 |
| Resend | メール通知 | 月3,000通 |
| Stripe | プレミアムプラン決済（フェーズ2） | 手数料のみ |

---

## 競合分析メモ

### DRECL（ドレクル）

- 個人間レンタル＆フリマのプラットフォーム
- システム手数料5%（キャンペーン中）
- AI試着機能あり（差別化要素として強力）
- 登録衣装数はまだ少ない（13件程度）
- デポジット制度があり取引フローが複雑
- 実態として手渡し・現金払いが多く、サービス内決済は使われていない可能性がある

### 差別化戦略

- **手数料0円**を前面に打ち出す
- **シンプルな取引フロー**（デポジットなし）
- **配送・手渡しの両方をフラットに対応** - どちらも使いやすい設計にする
- AI試着はフェーズ2以降で検討

---

## 開発・テストガイド

### 申請フローのテスト方法

出品者と借り手の2アカウントが必要なため、ブラウザを2つ並べて操作する。

```
左画面: アカウントA・出品者（Chrome）
右画面: アカウントB・借り手（Chromeのシークレットモード）
```

**テスト用メールアドレス**
Gmailの`+`エイリアスを使うと1つのGmailアドレスで複数アカウントを作れる。

```
yourname+owner@gmail.com  → 出品者アカウント用
yourname+renter@gmail.com → 借り手アカウント用
※ 両方とも同じGmailの受信箱に届く
```

**テスト手順**

```
① Aで衣装を登録
② Bで衣装を検索して申請
③ Aに申請通知が来るか確認
④ Aで承認ボタンを押す
⑤ Bに承認通知が来るか確認
⑥ A・B間でメッセージをやり取り
⑦ Bで「受け取りました」ボタンを押す → status: active を確認
⑧ Bで「返却しました」ボタンを押す
⑨ Aで「受け取りました」ボタンを押す → status: returning → returned を確認
⑩ A・Bに評価依頼通知が来るか確認
⑪ お互い評価を投稿
⑫ Aで「貸し出し可能にする」ボタンを押す
```

**statusの確認方法**
Supabase → Table Editor → rentals で各ステップのstatusを直接確認する。

**通知の確認方法**
- アプリ内通知: notificationsテーブルにレコードが追加されているか確認
- メール通知: Resend → Logs で送信ログを確認

**よくある詰まりポイント**
- RLSで操作できない → RLSポリシーをClaude Codeに確認させる
- statusが変わらない → ブラウザのDevTools → Console でエラーを確認してClaude Codeに貼る
- 通知が届かない → Supabase Realtimeの購読設定を確認する

---

### Supabaseメールテンプレートの編集

認証メールの文面は以下から編集できる。

```
Supabase → Authentication → Email Templates
```

編集できるテンプレート一覧。

```
Confirm signup        → 新規登録時の本人確認メール
Invite user           → ユーザー招待メール
Magic Link            → マジックリンクログイン
Change Email Address  → メールアドレス変更時
Reset Password        → パスワードリセット
```

編集時の注意点。
- `{{ .ConfirmationURL }}` は確認リンクに自動置換される変数なので必ず残す
- 件名（Subject）も日本語に変更しておく
- デフォルトは英語なので必ず日本語化する

件名の例。
```
【衣装レンタル掲示板】メールアドレスの確認
```

---

## DB操作のルール

- マイグレーションファイルの生成はOK
- db pushの前は必ずdry-runを実行して差分を報告すること
- db pushコマンド自体は提案のみ、実行はユーザーが行う
- 本番DBへの直接SQLは禁止

---

## 画像アップロード仕様

### 処理フロー

```
① 画像を選択
② react-image-cropで4:3固定のトリミングUIを表示
③ ユーザーが位置を調整・確定
④ browser-image-compressionで圧縮
⑤ Supabase Storageにアップロード
```

### 使用ライブラリ

```bash
npm install react-image-crop
npm install browser-image-compression
```

### 圧縮設定

```typescript
const options = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2560,
  useWebWorker: true,
}
```

### ルール

- アスペクト比: 4:3固定（トリミングUIで位置はユーザーが調整）
- 最大ファイルサイズ: 2MB
- 最大解像度: 2560px
- 枚数上限: 無料プラン3枚・プレミアムプラン10枚
- 圧縮はサーバーではなくブラウザ側で行う（コストゼロ）

---

## UI方針

### 基本方針

メルカリのUIを参考にしたシンプルで直感的な設計にする。多くのユーザーがメルカリを使っているため学習コストをゼロにできる。

### 申請・取引ページの設計ルール

- 現在のステータスを画面上部に大きく表示する
- 次にすべきアクションボタンを1つだけ目立たせる
- メッセージと取引操作を同一画面に配置する
- ステータスに応じてボタンの表示を切り替える
- 入力項目は最小限にしてシンプルに保つ
- 確認画面を挟んで誤操作を防ぐ
- ボタンは大きくして押しやすくする

### ステータス表示の考え方

メルカリと異なりレンタルは往復があるためステータスが多い。「今何をすべきか」を常に1つだけ表示することでシンプルさを保つ。

```
借り手に表示するアクション例:
  pending   → 「承認をお待ちください」
  approved  → 「受け渡し方法をメッセージで確認してください」
  active    → 「返却の準備ができたら返却報告してください」
  returning → 「オーナーの受取確認をお待ちください」
  returned  → 「評価を投稿してください」

出品者に表示するアクション例:
  pending   → 「申請を確認して承認・却下してください」
  approved  → 「受け渡し方法をメッセージで確認してください」
  active    → 「返却をお待ちください」
  returning → 「返却を受け取ったら確認してください」
  returned  → 「クリーニング・準備が完了したら貸し出し可能にしてください」
```

---

## SNS運用方針

### 基本方針

初期フェーズは手動投稿で運用する。登録数が増えてきたら自動化を検討する。

### 使い分け

```
Instagram → 衣装写真をメインに見せる・世界観を作る
X         → 新着情報・お知らせ・ユーザーとの交流
```

### 投稿タイミング

新着衣装が登録されたら手動で投稿する。1日5件程度までは手動で十分。

### Instagramの投稿テンプレート

```
✨ 新着衣装 ✨

カテゴリ: ラテン（女性）
エリア: 東京
価格: ¥3,000/日

プロフィールのリンクから詳細を確認できます👗

#社交ダンス #衣装レンタル #ラテンドレス #ダンス衣装
```

### Xの投稿テンプレート

```
【新着衣装】
カテゴリ: ラテン（女性）
エリア: 東京
価格: ¥3,000/日

▶ 詳細はこちら → [URL]

#社交ダンス #衣装レンタル #ラテン
```

### 画像利用に関する利用規約への追記事項

- 出品者の衣装写真をSNSに投稿する場合は事前に許可が必要
- 利用規約に「投稿した画像はサービスのSNSアカウントで紹介する場合があります」と明記する
- または衣装登録時に「SNSでの紹介を許可する」チェックボックスを設ける

### 自動化の検討タイミング

1日10件以上の登録が続くようになったらX API・Instagram APIでの自動投稿を検討する。X APIは現在有料のため費用対効果を見て判断する。
