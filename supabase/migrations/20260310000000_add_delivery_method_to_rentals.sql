-- rentals テーブルに受け渡し方法カラムを追加
-- 'shipping' = 全国発送, 'handover' = 手渡し
ALTER TABLE public.rentals
  ADD COLUMN delivery_method text NOT NULL DEFAULT 'shipping'
  CHECK (delivery_method IN ('shipping', 'handover'));
