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
