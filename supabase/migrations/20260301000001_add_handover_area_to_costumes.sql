-- costumes テーブルに手渡し可能エリアカラムを追加
ALTER TABLE costumes
  ADD COLUMN IF NOT EXISTS handover_area text;
