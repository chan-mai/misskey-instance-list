export interface Stats {
  counts: {
    known: number;
    active: number;
    exclusions: number;
    users: number;
  };
  repositories: {
    url: string;
    name: string | null;
    description: string | null;
    count: number;
  }[];
  languages: {
    code: string;
    count: number;
  }[];
}

export interface Instance {
  id: string; // domain
  node_name: string | null;
  users_count: number | null;
  notes_count: number | null;
  version: string | null;
  is_alive: boolean;
  created_at: string;
  last_updated: string | null;
  last_check_at: string | null;
  banner_url: string | null;
  icon_url: string | null;
  suspension_state: 'none' | 'suspended' | 'gone';
  recommendation_score: number | null;
  open_registrations: boolean | null;
  email_required: boolean | null;
  repository_url: string | null;
  language: string | null;
}
