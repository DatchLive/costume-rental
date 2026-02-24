-- ============================================================
-- Update rating_avg and rating_count on profiles when review is published
-- ============================================================
create or replace function public.update_profile_rating()
returns trigger language plpgsql security definer
as $$
begin
  if new.is_published = true and (old is null or old.is_published = false) then
    update public.profiles
    set
      rating_count = (
        select count(*) from public.reviews
        where reviewee_id = new.reviewee_id and is_published = true
      ),
      rating_avg = (
        select round(avg(rating)::numeric, 2)
        from public.reviews
        where reviewee_id = new.reviewee_id and is_published = true
      )
    where id = new.reviewee_id;
  end if;
  return new;
end;
$$;

create trigger on_review_published
  after insert or update on public.reviews
  for each row execute procedure public.update_profile_rating();

-- ============================================================
-- Publish reviews: both parties reviewed OR 7 days elapsed
-- Call this from API route after each review submission
-- ============================================================
create or replace function public.try_publish_reviews(p_rental_id uuid)
returns void language plpgsql security definer
as $$
declare
  v_review_count int;
  v_earliest_review timestamptz;
begin
  select count(*), min(created_at)
  into v_review_count, v_earliest_review
  from public.reviews
  where rental_id = p_rental_id;

  if v_review_count = 2 or (v_review_count >= 1 and v_earliest_review < now() - interval '7 days') then
    update public.reviews
    set is_published = true
    where rental_id = p_rental_id and is_published = false;
  end if;
end;
$$;

-- ============================================================
-- Create notification helper (called via service_role from API routes)
-- ============================================================
create or replace function public.create_notification(
  p_user_id    uuid,
  p_type       text,
  p_title      text,
  p_body       text default null,
  p_link       text default null
)
returns uuid language plpgsql security definer
as $$
declare
  v_id uuid;
begin
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user_id, p_type, p_title, p_body, p_link)
  returning id into v_id;
  return v_id;
end;
$$;
