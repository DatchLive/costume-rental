-- rentals.status の CHECK 制約に 'completed' を追加する
ALTER TABLE public.rentals
  DROP CONSTRAINT IF EXISTS rentals_status_check;

ALTER TABLE public.rentals
  ADD CONSTRAINT rentals_status_check CHECK (status IN (
    'pending', 'approved', 'rejected', 'active', 'returning', 'returned', 'completed', 'cancelled'
  ));

-- try_publish_reviews: 双方評価投稿済み or 7日経過で reviews を公開し、rentals を completed に更新する
CREATE OR REPLACE FUNCTION public.try_publish_reviews(p_rental_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_review_count   int;
  v_earliest_review timestamptz;
  v_should_publish bool := false;
BEGIN
  SELECT count(*), min(created_at)
  INTO v_review_count, v_earliest_review
  FROM public.reviews
  WHERE rental_id = p_rental_id;

  IF v_review_count = 2
     OR (v_review_count >= 1 AND v_earliest_review < now() - interval '7 days')
  THEN
    v_should_publish := true;
  END IF;

  IF v_should_publish THEN
    -- reviews を公開
    UPDATE public.reviews
    SET is_published = true
    WHERE rental_id = p_rental_id AND is_published = false;

    -- rental を取引完了にする
    UPDATE public.rentals
    SET status = 'completed'
    WHERE id = p_rental_id AND status = 'returned';
  END IF;
END;
$$;
