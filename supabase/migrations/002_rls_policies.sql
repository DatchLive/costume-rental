-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.costumes enable row level security;
alter table public.rentals enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

-- ============================================================
-- PROFILES RLS
-- ============================================================
-- Public read (for listing owners on costume cards)
create policy "profiles_select_public"
  on public.profiles for select using (true);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- COSTUMES RLS
-- ============================================================
-- Public can read available/renting costumes; owner can see their own hidden ones
create policy "costumes_select_public"
  on public.costumes for select
  using (status != 'hidden' or auth.uid() = user_id);

-- Owner can insert
create policy "costumes_insert_own"
  on public.costumes for insert
  with check (auth.uid() = user_id);

-- Owner can update their own
create policy "costumes_update_own"
  on public.costumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Owner can delete their own
create policy "costumes_delete_own"
  on public.costumes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RENTALS RLS
-- ============================================================
-- Renter and owner can see their own rentals
create policy "rentals_select_participant"
  on public.rentals for select
  using (auth.uid() = renter_id or auth.uid() = owner_id);

-- Authenticated user can create a rental request (as renter)
create policy "rentals_insert_renter"
  on public.rentals for insert
  with check (auth.uid() = renter_id);

-- Participants can update rental status
create policy "rentals_update_participant"
  on public.rentals for update
  using (auth.uid() = owner_id or auth.uid() = renter_id);

-- ============================================================
-- MESSAGES RLS
-- ============================================================
-- Only rental participants can read messages
create policy "messages_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.rentals r
      where r.id = messages.rental_id
        and (r.renter_id = auth.uid() or r.owner_id = auth.uid())
    )
  );

-- Only rental participants can send messages
create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.rentals r
      where r.id = rental_id
        and (r.renter_id = auth.uid() or r.owner_id = auth.uid())
    )
  );

-- Participants can mark messages as read
create policy "messages_update_participant"
  on public.messages for update
  using (
    exists (
      select 1 from public.rentals r
      where r.id = messages.rental_id
        and (r.renter_id = auth.uid() or r.owner_id = auth.uid())
    )
  );

-- ============================================================
-- REVIEWS RLS
-- ============================================================
-- Published reviews are public; unpublished visible only to reviewer
create policy "reviews_select"
  on public.reviews for select
  using (is_published = true or reviewer_id = auth.uid());

-- Rental participant can write a review after rental is returned
create policy "reviews_insert"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.rentals r
      where r.id = rental_id
        and (r.renter_id = auth.uid() or r.owner_id = auth.uid())
        and r.status = 'returned'
    )
  );

-- ============================================================
-- NOTIFICATIONS RLS
-- ============================================================
-- Users see only their own notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Mark as read
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Insert via service_role key only (no user insert policy)

-- ============================================================
-- FAVORITES RLS
-- ============================================================
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ============================================================
-- REPORTS RLS
-- ============================================================
create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "reports_insert"
  on public.reports for insert
  with check (auth.uid() = reporter_id);
