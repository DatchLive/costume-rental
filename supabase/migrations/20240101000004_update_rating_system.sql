-- ============================================================
-- Update rating system: replace 1-5 stars with good/bad (Mercari-style)
-- ============================================================

-- 1. Update profiles: replace rating_avg / rating_count with good_count / bad_count
alter table public.profiles
  add column good_count int default 0 not null,
  add column bad_count  int default 0 not null;

alter table public.profiles
  drop column if exists rating_avg,
  drop column if exists rating_count;

-- 2. Update reviews: change rating from int to text('good'|'bad'),
--    remove sub-rating columns
alter table public.reviews
  drop column if exists accuracy_rating,
  drop column if exists response_rating,
  drop column if exists return_rating;

alter table public.reviews
  drop constraint if exists reviews_rating_check;

-- Convert existing int ratings: 4-5 → 'good', 1-3 → 'bad'
alter table public.reviews
  alter column rating type text
  using case when rating::int >= 4 then 'good' else 'bad' end;

alter table public.reviews
  add constraint reviews_rating_check check (rating in ('good', 'bad'));

-- 3. Update the trigger function to count good/bad instead of averaging
create or replace function public.update_profile_rating()
returns trigger language plpgsql security definer
as $$
begin
  if new.is_published = true and (old is null or old.is_published = false) then
    update public.profiles
    set
      good_count = (
        select count(*) from public.reviews
        where reviewee_id = new.reviewee_id
          and is_published = true
          and rating = 'good'
      ),
      bad_count = (
        select count(*) from public.reviews
        where reviewee_id = new.reviewee_id
          and is_published = true
          and rating = 'bad'
      )
    where id = new.reviewee_id;
  end if;
  return new;
end;
$$;
