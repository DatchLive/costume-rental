-- use_date カラムを追加し、既存データを start_date から移行する
ALTER TABLE public.rentals
  ADD COLUMN use_date date;

UPDATE public.rentals
  SET use_date = start_date::date
  WHERE use_date IS NULL;

ALTER TABLE public.rentals
  ALTER COLUMN use_date SET NOT NULL;

-- 旧カラムを削除
ALTER TABLE public.rentals
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS end_date;
