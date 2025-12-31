interface StatsRepository {
  url: string;
  name: string | null;
  description: string | null;
  count: number;
}

interface Stats {
  counts: {
    known: number;
    active: number;
    exclusions: number;
    users: number;
  };
  repositories: StatsRepository[];
  languages: {
    code: string;
    count: number;
  }[];
}

type StatsResponse = Stats

interface Instance {
  host: string; // domain
  name: string | null;
  users_count: number | null;
  notes_count: number | null;
  version: string | null;
  is_alive: boolean;
  created_at: number | null;
  last_updated: number | null;
  last_check_at: number | null;
  banner_url: string | null;
  icon_url: string | null;
  suspension_state: 'none' | 'suspended' | 'gone';
  recommendation_score: number | null;
  open_registrations: boolean | null;
  email_required: boolean | null;
  repository_url: string | null;
  language: string | null;
}

interface InstancesResponse {
  items: Instance[];
  total: number;
  limit: number;
  offset: number;
}

interface ExclusionResponse {
  domain: string;
  reason: string | null;
}
