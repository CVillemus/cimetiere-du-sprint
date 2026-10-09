/**
 * Types de la base Supabase (des `type` et non des `interface` : supabase-js l'exige), écrits à la main d'après supabase/migrations/001_schema_de_vote.sql.
 * Ils donnent un client Supabase typé : une faute de nom de colonne ne compile pas.
 * (Ils pourraient aussi être générés par la CLI Supabase : `supabase gen types typescript`.)
 */
export type VotingStageRow = 'lobby' | 'film' | 'sprint-review';

export type VotingSessionRow = {
  id: string;
  host_user_id: string;
  stage: VotingStageRow;
  current_film_id: string | null;
  revealed_film_ids: string[];
  created_at: string;
};

export type ParticipantRow = {
  id: string;
  session_id: string;
  user_id: string;
  pseudo: string;
  created_at: string;
};

export type VoteRow = {
  id: string;
  session_id: string;
  participant_id: string;
  film_id: string;
  score: number;
  updated_at: string;
};

export type VoteReceiptRow = {
  session_id: string;
  participant_id: string;
  film_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      voting_session: {
        Row: VotingSessionRow;
        Insert: Partial<VotingSessionRow>;
        Update: Partial<VotingSessionRow>;
        Relationships: [];
      };
      participant: {
        Row: ParticipantRow;
        Insert: Pick<ParticipantRow, 'session_id' | 'pseudo'> & Partial<ParticipantRow>;
        Update: Partial<ParticipantRow>;
        Relationships: [];
      };
      vote: {
        Row: VoteRow;
        Insert: Pick<VoteRow, 'session_id' | 'participant_id' | 'film_id' | 'score'> &
          Partial<VoteRow>;
        Update: Partial<VoteRow>;
        Relationships: [];
      };
      vote_receipt: {
        Row: VoteReceiptRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
