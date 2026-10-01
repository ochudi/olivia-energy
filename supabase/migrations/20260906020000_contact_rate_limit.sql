-- =====================================================================
-- Contact-form rate limit. A sender may create at most 3 contact_messages
-- per rolling hour; the fourth insert fails with SQLSTATE PT429, which
-- PostgREST returns as HTTP 429 (supabase-js: error.code = 'PT429').
--
-- Enforced in a BEFORE INSERT trigger so every path is covered: the form
-- handler, and a direct API call with the anon key. The function is
-- SECURITY DEFINER because anon may not select from contact_messages.
-- =====================================================================

create index if not exists contact_messages_email_recent_idx
  on public.contact_messages (lower(email), created_at desc);

create or replace function public.contact_messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
begin
  select count(*) into recent
  from public.contact_messages
  where lower(email) = lower(new.email)
    and created_at > now() - interval '1 hour';
  if recent >= 3 then
    raise exception 'rate_limited: more than 3 messages from this address in the last hour'
      using errcode = 'PT429',
            hint = 'Wait an hour before sending another message.';
  end if;
  return new;
end;
$$;
comment on function public.contact_messages_rate_limit() is
  'Rejects a 4th contact message from the same email within an hour (SQLSTATE PT429 → HTTP 429).';

-- Trigger functions run without an EXECUTE check; revoking keeps the
-- function from being called directly.
revoke all on function public.contact_messages_rate_limit() from public, anon, authenticated;

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
  before insert on public.contact_messages
  for each row execute function public.contact_messages_rate_limit();
