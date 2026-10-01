-- Harness-only helpers the auth proxy calls through PostgREST with a service token.
create or replace function public.__harness_login(p_email text, p_password text)
returns json language sql security definer set search_path = '' as $$
  select json_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at,
    'app_metadata', coalesce(u.raw_app_meta_data, '{}'::jsonb), 'user_metadata', coalesce(u.raw_user_meta_data, '{}'::jsonb))
  from auth.users u
  where lower(u.email) = lower(p_email)
    and u.encrypted_password = extensions.crypt(p_password, u.encrypted_password)
  limit 1
$$;
create or replace function public.__harness_users()
returns json language sql security definer set search_path = '' as $$
  select coalesce(json_agg(json_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at, 'email_confirmed_at', u.email_confirmed_at,
    'app_metadata', coalesce(u.raw_app_meta_data, '{}'::jsonb), 'user_metadata', coalesce(u.raw_user_meta_data, '{}'::jsonb)) order by u.created_at), '[]'::json)
  from auth.users u
$$;
revoke all on function public.__harness_login(text, text), public.__harness_users() from public, anon, authenticated;
grant execute on function public.__harness_login(text, text), public.__harness_users() to service_role;
