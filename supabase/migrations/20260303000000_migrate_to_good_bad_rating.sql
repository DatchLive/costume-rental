-- profiles: rating_avg/rating_count → good_count/total_count
ALTER TABLE public.profiles
  ADD COLUMN good_count  int not null default 0,
  ADD COLUMN total_count int not null default 0;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS rating_avg,
  DROP COLUMN IF EXISTS rating_count;

-- reviews: rating (int) → rating (text 'good'|'bad')
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_check;

ALTER TABLE public.reviews
  ALTER COLUMN rating TYPE text
  USING (CASE WHEN rating::int >= 3 THEN 'good' ELSE 'bad' END);

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_check CHECK (rating IN ('good', 'bad'));

-- reviews: tags 追加、旧スコアカラム削除
ALTER TABLE public.reviews
  ADD COLUMN tags text[] default '{}';

ALTER TABLE public.reviews
  DROP COLUMN IF EXISTS accuracy_rating,
  DROP COLUMN IF EXISTS response_rating,
  DROP COLUMN IF EXISTS return_rating;

-- トリガー関数を更新: good_count/total_count を使うように
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF new.is_published = true AND (old IS NULL OR old.is_published = false) THEN
    UPDATE public.profiles
    SET
      good_count = (
        SELECT count(*) FROM public.reviews
        WHERE reviewee_id = new.reviewee_id
          AND is_published = true
          AND rating = 'good'
      ),
      total_count = (
        SELECT count(*) FROM public.reviews
        WHERE reviewee_id = new.reviewee_id
          AND is_published = true
      )
    WHERE id = new.reviewee_id;
  END IF;
  RETURN new;
END;
$$;
