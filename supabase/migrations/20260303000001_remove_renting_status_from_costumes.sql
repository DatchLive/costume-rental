-- 既存の 'renting' レコードを 'available' に戻す
UPDATE public.costumes SET status = 'available' WHERE status = 'renting';

-- CHECK 制約を更新（'renting' を除外）
ALTER TABLE public.costumes DROP CONSTRAINT IF EXISTS costumes_status_check;
ALTER TABLE public.costumes
  ADD CONSTRAINT costumes_status_check CHECK (status IN ('available', 'hidden'));
