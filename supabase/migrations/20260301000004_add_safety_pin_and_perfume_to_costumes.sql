-- costumes テーブルに安全ピン・香水カラムを追加
ALTER TABLE costumes
  ADD COLUMN IF NOT EXISTS safety_pin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS perfume    boolean NOT NULL DEFAULT false;
