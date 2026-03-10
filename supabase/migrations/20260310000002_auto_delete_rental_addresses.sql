-- rentals に完了日時カラムを追加
ALTER TABLE public.rentals
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- status が 'completed' になった瞬間に completed_at を記録するトリガー
CREATE OR REPLACE FUNCTION public.set_rental_completed_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER rental_completed_at_trigger
  BEFORE UPDATE ON public.rentals
  FOR EACH ROW EXECUTE FUNCTION public.set_rental_completed_at();

-- pg_cron: 毎日午前3時に、完了から30日経過した取引の住所を物理削除
-- ※ 事前に Supabase Dashboard → Database → Extensions で pg_cron を有効化すること
SELECT cron.schedule(
  'delete-old-rental-addresses',
  '0 3 * * *',
  $$
    DELETE FROM public.rental_addresses
    WHERE rental_id IN (
      SELECT id FROM public.rentals
      WHERE status = 'completed'
        AND completed_at < now() - interval '30 days'
    );
  $$
);
