-- costumes テーブルに準備日数カラムを追加
ALTER TABLE costumes
  ADD COLUMN IF NOT EXISTS buffer_days int NOT NULL DEFAULT 2;
