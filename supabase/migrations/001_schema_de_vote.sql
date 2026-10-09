-- =====================================================================
-- Le Cimetière du Sprint : schéma de vote
-- À exécuter une seule fois dans Supabase : SQL Editor → New query → Run.
-- =====================================================================
--
-- Principe de sécurité :
-- - Tout le monde (TV et téléphones) se connecte en « anonyme » : chaque appareil
--   reçoit un identifiant Supabase stable (auth.uid()), sans email ni mot de passe.
-- - Seule la TV qui a créé la session (host_user_id) peut la piloter.
-- - Chacun ne peut voter que pour lui-même, pour le film affiché, avant la révélation.
-- - Les scores des autres restent illisibles tant que le film n'est pas révélé.
--   La TV voit seulement QUI a voté, grâce à la table vote_receipt (sans score).

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table public.voting_session (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  stage text not null default 'lobby' check (stage in ('lobby', 'film', 'sprint-review')),
  current_film_id text,
  revealed_film_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  check ((stage = 'film') = (current_film_id is not null))
);

create table public.participant (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.voting_session (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pseudo text not null check (char_length(btrim(pseudo)) between 1 and 20),
  created_at timestamptz not null default now(),
  unique (session_id, user_id),
  unique (session_id, pseudo)
);

create table public.vote (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.voting_session (id) on delete cascade,
  participant_id uuid not null references public.participant (id) on delete cascade,
  film_id text not null,
  score smallint not null check (score between 1 and 5),
  updated_at timestamptz not null default now(),
  unique (participant_id, film_id)
);

-- « Accusé de vote » : dit qu'un participant a voté pour un film, sans dire quoi.
create table public.vote_receipt (
  session_id uuid not null references public.voting_session (id) on delete cascade,
  participant_id uuid not null references public.participant (id) on delete cascade,
  film_id text not null,
  created_at timestamptz not null default now(),
  primary key (participant_id, film_id)
);

create index vote_session_film_idx on public.vote (session_id, film_id);
create index vote_receipt_session_film_idx on public.vote_receipt (session_id, film_id);

-- ---------------------------------------------------------------------
-- Fonctions utilitaires (security definer : elles lisent sans repasser par la RLS)
-- ---------------------------------------------------------------------

-- Le participant appartient-il à l'utilisateur connecté ?
create function public.is_own_participant(target_participant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.participant
    where id = target_participant_id and user_id = auth.uid()
  );
$$;

-- Peut-on encore voter pour ce film dans cette session ?
create function public.is_film_open_for_votes(target_session_id uuid, target_film_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.voting_session
    where id = target_session_id
      and stage = 'film'
      and current_film_id = target_film_id
      and not (target_film_id = any (revealed_film_ids))
  );
$$;

-- Le vote de ce film est-il visible par tous ? (révélé, ou film déjà passé)
create function public.is_film_vote_public(target_session_id uuid, target_film_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.voting_session
    where id = target_session_id
      and (
        target_film_id = any (revealed_film_ids)
        or current_film_id is distinct from target_film_id
      )
  );
$$;

-- À chaque premier vote, on crée l'accusé de vote correspondant.
create function public.create_vote_receipt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.vote_receipt (session_id, participant_id, film_id)
  values (new.session_id, new.participant_id, new.film_id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger vote_creates_receipt
after insert on public.vote
for each row execute function public.create_vote_receipt();

-- Horodatage des changements d'avis.
create function public.touch_vote_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vote_touches_updated_at
before update on public.vote
for each row execute function public.touch_vote_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.voting_session enable row level security;
alter table public.participant enable row level security;
alter table public.vote enable row level security;
alter table public.vote_receipt enable row level security;

-- Sessions : lisibles par tous, créées et pilotées par leur TV uniquement.
create policy "Sessions lisibles par tous"
on public.voting_session for select to authenticated
using (true);

create policy "Une TV crée sa propre session"
on public.voting_session for insert to authenticated
with check (host_user_id = (select auth.uid()));

create policy "Seule la TV hôte pilote la session"
on public.voting_session for update to authenticated
using (host_user_id = (select auth.uid()))
with check (host_user_id = (select auth.uid()));

-- Participants : lisibles par tous, chacun ne s'inscrit que lui-même.
create policy "Participants lisibles par tous"
on public.participant for select to authenticated
using (true);

create policy "Chacun s'inscrit soi-même"
on public.participant for insert to authenticated
with check (user_id = (select auth.uid()));

-- Votes : on lit les siens, et ceux des autres seulement une fois le film révélé.
create policy "Lire ses votes, ou les votes révélés"
on public.vote for select to authenticated
using (
  public.is_own_participant(participant_id)
  or public.is_film_vote_public(session_id, film_id)
);

create policy "Voter pour soi, sur le film ouvert"
on public.vote for insert to authenticated
with check (
  public.is_own_participant(participant_id)
  and public.is_film_open_for_votes(session_id, film_id)
);

create policy "Changer d'avis avant la révélation"
on public.vote for update to authenticated
using (public.is_own_participant(participant_id))
with check (
  public.is_own_participant(participant_id)
  and public.is_film_open_for_votes(session_id, film_id)
);

-- Accusés de vote : lisibles par tous, écrits uniquement par le trigger.
create policy "Accusés de vote lisibles par tous"
on public.vote_receipt for select to authenticated
using (true);

-- ---------------------------------------------------------------------
-- Temps réel : on diffuse les changements de ces tables (filtrés par la RLS).
-- ---------------------------------------------------------------------

alter publication supabase_realtime
add table public.voting_session, public.participant, public.vote, public.vote_receipt;
