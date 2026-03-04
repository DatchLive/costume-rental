-- ============================================================
-- COSTUME REVIEWS
-- ============================================================
create table public.costume_reviews (
  id                uuid primary key default gen_random_uuid(),
  rental_id         uuid references public.rentals(id) on delete restrict not null,
  costume_id        uuid references public.costumes(id) on delete restrict not null,
  reviewer_id       uuid references public.profiles(id) on delete restrict not null,
  size_fit          text check (size_fit in ('small', 'just', 'large')),
  photo_match       text check (photo_match in ('same', 'slightly_different')),
  condition         text check (condition in ('good', 'normal')),
  recommended_scene text[] default '{}',
  comment           text,
  created_at        timestamptz default now() not null,
  unique (rental_id, reviewer_id)
);

create index idx_costume_reviews_costume_id on public.costume_reviews(costume_id);
create index idx_costume_reviews_reviewer_id on public.costume_reviews(reviewer_id);

-- ============================================================
-- RLS
-- ============================================================
alter table public.costume_reviews enable row level security;

-- Anyone can read costume reviews
create policy "costume_reviews_select_public"
  on public.costume_reviews for select
  using (true);

-- Only the renter of a returned rental can submit a costume review
create policy "costume_reviews_insert_renter"
  on public.costume_reviews for insert
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.rentals r
      where r.id = rental_id
        and r.renter_id = auth.uid()
        and r.status = 'returned'
    )
  );
