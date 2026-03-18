-- Add rating (good/bad) to costume_reviews
alter table public.costume_reviews
  add column rating text check (rating in ('good', 'bad'));
