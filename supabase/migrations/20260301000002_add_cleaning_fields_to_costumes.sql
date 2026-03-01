-- costumes テーブルにクリーニング設定カラムを追加
ALTER TABLE costumes
  ADD COLUMN IF NOT EXISTS cleaning_responsibility text NOT NULL DEFAULT 'renter_home',
  ADD COLUMN IF NOT EXISTS cleaning_notes text;
