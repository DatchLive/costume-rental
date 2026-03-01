-- certan_ok / body_foundation_ok → tanning_policy に置き換え
ALTER TABLE costumes
  ADD COLUMN IF NOT EXISTS tanning_policy text NOT NULL DEFAULT 'none';

-- 既存データを移行
UPDATE costumes SET tanning_policy =
  CASE
    WHEN certan_ok = true AND body_foundation_ok = true THEN 'all'
    WHEN certan_ok = true THEN 'self'
    ELSE 'none'
  END;

-- 旧カラムを削除
ALTER TABLE costumes
  DROP COLUMN IF EXISTS certan_ok,
  DROP COLUMN IF EXISTS body_foundation_ok;
