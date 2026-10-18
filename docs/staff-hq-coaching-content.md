# Staff HQ: client records and coaching content

## Implemented in this branch

- **Client app data** gives staff a per-client profile summary and read-only views for check-ins, progress logs, nutrition logs, workout sessions, coach messages, memberships and assigned nutrition plans.
- **Videos** scaffolds a coaching video catalogue with title, category, description, source URL, optional thumbnail, duration, level and active/hidden state.
- **Plans & pricing** adds a confirmed delete action for plans that are no longer referenced. The database remains the authority: referenced plans can be protected by foreign-key constraints, so deactivate/hide them instead.
- The demo preview remains fictional and browser-local. No mobile app code or dummy app records are changed by this branch.

## Before enabling the live video catalogue

The website and app share the MW Fitness Neon database. The current schema does not yet include `public.coaching_videos`; the video panel intentionally detects that condition and explains that the schema is pending instead of pretending saves work.

Add the following as the next ordered migration in the companion `MW-FITNESS-APP-MOBILE/neon/migrations/` directory after review. **Do not apply it to the shared/production database as part of this scaffold.**

```sql
create table if not exists public.coaching_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'General',
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  level text not null default 'All levels',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coaching_videos_active_created_idx
  on public.coaching_videos(active, created_at desc);

alter table public.coaching_videos enable row level security;

create policy "active coaching videos readable by signed-in clients"
  on public.coaching_videos for select to authenticated
  using (active = true);

create policy "staff can manage coaching videos"
  on public.coaching_videos for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger coaching_videos_set_updated_at
  before update on public.coaching_videos
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.coaching_videos to authenticated;
```

The mobile app should continue showing its existing dummy data. Reading the new video catalogue in the app is a separate later change after the schema, admin CRUD and permissions have been verified.

## Account deletion safety

Creating and editing a profile is not the same as deleting the Neon Auth identity. A client-side delete of only `public.profiles` would leave an orphaned login identity and is intentionally not implemented as a fake delete. Permanent account removal needs a server-side, staff-authorized Neon Auth deletion operation, with audit/confirmation and related-data retention behavior defined first. The existing account-deletion request screen remains separate from this staff scaffold.

## Remaining work

1. Add and review the video migration in the mobile repository; do not apply it without explicit approval.
2. Build out client detail editing and staff-authorized account deletion via a verified server-side Auth admin API.
3. Add video upload/storage (rather than only external URLs), assignment/tagging by programme, and playback links.
4. Review role permissions and RLS against a real coach account before using live customer records.
5. Keep app integration disabled until the website and database path are verified; the current app dummy data stays untouched.


## Online coaching programmes migration (draft only)

The Staff HQ programme builder expects two new tables. Keep this migration in review until it has been tested against a disposable Neon branch and aligned with the companion app schema. Do not apply it to the shared production database as part of the scaffold.

```sql
create table if not exists public.coaching_programmes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_weeks integer not null check (duration_weeks between 1 and 104),
  days_per_week integer not null check (days_per_week between 1 and 7),
  level text not null default 'All levels',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coaching_programmes_active_idx
  on public.coaching_programmes(active, name);

alter table public.coaching_programmes enable row level security;

create policy "active coaching programmes readable by signed-in clients"
  on public.coaching_programmes for select to authenticated
  using (active = true or public.is_admin());

create policy "staff can manage coaching programmes"
  on public.coaching_programmes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger coaching_programmes_set_updated_at
  before update on public.coaching_programmes
  for each row execute function public.set_updated_at();

create table if not exists public.coaching_programme_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  programme_id uuid not null references public.coaching_programmes(id) on delete restrict,
  starts_on date not null default current_date,
  status text not null default 'active'
    check (status in ('active', 'completed', 'paused', 'cancelled')),
  coach_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coaching_programme_assignments_profile_idx
  on public.coaching_programme_assignments(profile_id, starts_on desc);

alter table public.coaching_programme_assignments enable row level security;

create policy "clients can view their own programme assignments"
  on public.coaching_programme_assignments for select to authenticated
  using (auth.uid() = profile_id or public.is_admin());

create policy "staff can manage programme assignments"
  on public.coaching_programme_assignments for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger coaching_programme_assignments_set_updated_at
  before update on public.coaching_programme_assignments
  for each row execute function public.set_updated_at();

grant select on public.coaching_programmes, public.coaching_programme_assignments to authenticated;
grant insert, update, delete on public.coaching_programmes, public.coaching_programme_assignments to authenticated;
```

This first version stores programme metadata and assignments only. Detailed week-by-week exercise prescriptions, progression rules and in-app presentation need a separate reviewed schema and app implementation; this scaffold does not claim those are wired to the Android app.


## Staff-role hardening (draft; review before shared DB changes)

The current shared schema's `public.is_admin()` helper returns true for both `coach` and `admin`. That is useful for staff data access, but it must not be the only protection around promoting users to the `admin` role. Add a role-change guard after testing it against a disposable Neon branch:

```sql
create or replace function public.prevent_unauthorised_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text;
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    select p.role into caller_role
    from public.profiles p
    where p.id = auth.uid();

    if caller_role is distinct from 'admin' then
      raise exception 'Only an administrator can change account roles'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_change_guard on public.profiles;
create trigger profiles_role_change_guard
  before update of role on public.profiles
  for each row execute function public.prevent_unauthorised_profile_role_change();
```

This is intentionally documented only. Do not apply it to the shared database without reviewing how the deployment's Neon Auth/Data API role maps to `auth.uid()` and testing coach edits, admin edits and trusted server operations. It also does not replace a proper audit trail for role changes.
