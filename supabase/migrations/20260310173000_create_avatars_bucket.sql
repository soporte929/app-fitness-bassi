insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true) on conflict (id) do nothing;
create policy "Avatar images are publicly accessible." on storage.objects for
select to public using (bucket_id = 'avatars');
create policy "Anyone can upload an avatar." on storage.objects for
insert to authenticated with check (bucket_id = 'avatars');
create policy "Anyone can update their own avatar." on storage.objects for
update to authenticated using (
        bucket_id = 'avatars'
        and auth.uid() = owner
    );