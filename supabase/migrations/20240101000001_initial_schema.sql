-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  name         text,
  area         text,
  bio          text,
  avatar_url   text,
  is_verified  boolean default false not null,
  rating_avg   numeric(3,2) default 0,
  rating_count int default 0 not null,
  plan         text default 'free' not null check (plan in ('free', 'premium')),
  created_at   timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COSTUMES
-- ============================================================
create table public.costumes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade not null,
  title            text not null,
  description      text,
  category         text not null check (category in (
    'ラテン（女性）', 'ラテン（男性）',
    'スタンダード（女性）', 'スタンダード（男性）',
    '練習着', 'アクセサリー・小物', 'その他'
  )),
  size             text,
  price_per_day    int not null check (price_per_day > 0),
  images           text[] default '{}',
  area             text,
  ships_nationwide boolean default false not null,
  min_rental_days  int default 2 not null check (min_rental_days >= 2),
  max_rental_days  int default 14 not null check (max_rental_days <= 30),
  status           text default 'available' not null check (status in ('available', 'renting', 'hidden')),
  created_at       timestamptz default now() not null
);

create index idx_costumes_user_id on public.costumes(user_id);
create index idx_costumes_status on public.costumes(status);
create index idx_costumes_category on public.costumes(category);
create index idx_costumes_area on public.costumes(area);
create index idx_costumes_created_at on public.costumes(created_at desc);

-- ============================================================
-- RENTALS
-- ============================================================
create table public.rentals (
  id            uuid primary key default gen_random_uuid(),
  costume_id    uuid references public.costumes(id) on delete restrict not null,
  renter_id     uuid references public.profiles(id) on delete restrict not null,
  owner_id      uuid references public.profiles(id) on delete restrict not null,
  start_date    date not null,
  end_date      date not null,
  total_price   int not null check (total_price > 0),
  platform_fee  int not null default 0,
  status        text default 'pending' not null check (status in (
    'pending', 'approved', 'rejected', 'active', 'returned', 'cancelled'
  )),
  cancel_reason text,
  created_at    timestamptz default now() not null,
  constraint rentals_dates_check check (end_date > start_date)
);

create index idx_rentals_renter_id on public.rentals(renter_id);
create index idx_rentals_owner_id on public.rentals(owner_id);
create index idx_rentals_costume_id on public.rentals(costume_id);
create index idx_rentals_status on public.rentals(status);

-- ============================================================
-- MESSAGES
-- ============================================================
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  rental_id  uuid references public.rentals(id) on delete cascade not null,
  sender_id  uuid references public.profiles(id) on delete restrict not null,
  content    text not null,
  is_read    boolean default false not null,
  created_at timestamptz default now() not null
);

create index idx_messages_rental_id on public.messages(rental_id);
create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_created_at on public.messages(created_at);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id              uuid primary key default gen_random_uuid(),
  rental_id       uuid references public.rentals(id) on delete restrict not null,
  reviewer_id     uuid references public.profiles(id) on delete restrict not null,
  reviewee_id     uuid references public.profiles(id) on delete restrict not null,
  role            text not null check (role in ('owner', 'renter')),
  rating          int not null check (rating between 1 and 5),
  accuracy_rating int check (accuracy_rating between 1 and 5),
  response_rating int check (response_rating between 1 and 5),
  return_rating   int check (return_rating between 1 and 5),
  comment         text,
  is_published    boolean default false not null,
  created_at      timestamptz default now() not null,
  unique (rental_id, reviewer_id)
);

create index idx_reviews_reviewee_id on public.reviews(reviewee_id);
create index idx_reviews_rental_id on public.reviews(rental_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  type       text not null check (type in (
    'rental_requested', 'rental_approved', 'rental_rejected',
    'message_received', 'rental_returned', 'review_received', 'return_reminder'
  )),
  title      text not null,
  body       text,
  link       text,
  is_read    boolean default false not null,
  created_at timestamptz default now() not null
);

create index idx_notifications_user_id_read on public.notifications(user_id, is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- ============================================================
-- FAVORITES
-- ============================================================
create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  costume_id uuid references public.costumes(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, costume_id)
);

create index idx_favorites_user_id on public.favorites(user_id);

-- ============================================================
-- REPORTS
-- ============================================================
create table public.reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid references public.profiles(id) on delete restrict not null,
  target_user_id    uuid references public.profiles(id) on delete restrict,
  target_costume_id uuid references public.costumes(id) on delete restrict,
  reason            text not null,
  status            text default 'pending' not null check (status in ('pending', 'resolved', 'dismissed')),
  created_at        timestamptz default now() not null,
  constraint reports_target_check check (
    target_user_id is not null or target_costume_id is not null
  )
);
