-- =====================================================================
-- Le Cimetière du Sprint : remise à zéro avant la soirée
-- À lancer la veille dans Supabase : SQL Editor → New query → Run.
-- =====================================================================
--
-- Supprime toutes les séances, et en cascade les participants, votes et accusés de vote.
-- Les tables, les règles RLS et le temps réel restent en place.
-- Les comptes anonymes (Authentication → Users) ne gênent pas : ils peuvent rester.

truncate public.voting_session cascade;
