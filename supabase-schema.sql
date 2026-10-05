create table if not exists public.choices (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_key text not null,
  mark text not null check (mark in ('⭐','🔥','👍','❌')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, character_key)
);

alter table public.choices enable row level security;

create policy "Users can read own choices"
on public.choices for select
using (auth.uid() = user_id);

create policy "Users can insert own choices"
on public.choices for insert
with check (auth.uid() = user_id);

create policy "Users can update own choices"
on public.choices for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own choices"
on public.choices for delete
using (auth.uid() = user_id);
