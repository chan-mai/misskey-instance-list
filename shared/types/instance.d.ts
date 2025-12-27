interface Instance {
  id: string;
  node_name: string;
  users_count: number;
  notes_count: number;
  version: string;
  is_alive: boolean;
  created_at: number;
  last_updated: number | null;
  last_check_at: number | null;
  icon_url: string | null;
  banner_url: string | null;
  recommendation_score: number | null;
  open_registrations?: boolean | null;
  email_required?: boolean | null;
  language?: string | null;
}
