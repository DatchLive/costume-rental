-- ============================================================
-- Storage buckets
-- ============================================================

-- Costume images bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'costume-images',
  'costume-images',
  true,
  5242880,  -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Avatars bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS: costume-images
-- Path pattern: {userId}/{filename}
-- ============================================================
create policy "costume_images_select_public"
  on storage.objects for select
  using (bucket_id = 'costume-images');

create policy "costume_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'costume-images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "costume_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'costume-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "costume_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'costume-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Storage RLS: avatars
-- Path pattern: {userId}/{filename}
-- ============================================================
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
