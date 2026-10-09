import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from './database.types';

export type CimetiereSupabaseClient = SupabaseClient<Database>;

/**
 * Client Supabase unique, créé à la première injection seulement :
 * une page qui ne vote pas ne l'instancie jamais.
 */
export const SUPABASE_CLIENT: InjectionToken<CimetiereSupabaseClient> =
  new InjectionToken<CimetiereSupabaseClient>('SUPABASE_CLIENT', {
    providedIn: 'root',
    factory: (): CimetiereSupabaseClient =>
      createClient<Database>(environment.supabaseUrl, environment.supabasePublishableKey),
  });
