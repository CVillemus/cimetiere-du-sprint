/**
 * Configuration publique du front.
 * La clé « publishable » de Supabase est faite pour être exposée dans le navigateur :
 * la sécurité repose sur les règles RLS de la base (voir supabase/migrations).
 * Ne JAMAIS mettre ici la clé `service_role` / `secret`.
 */
export const environment = {
  supabaseUrl: 'https://gefnamrhinnzeglcdemy.supabase.co',
  supabasePublishableKey: 'sb_publishable_WCW07CElMbqXIxyt0MhB5w__65VmYXK',
} as const;
