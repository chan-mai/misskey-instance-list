interface Instance {
  id: string;
  host: string;
  name: string | null;
  node_name: string | null;
  software_name: string;
  software_version: string;
  version: string;
  icon_url: string | null;
  favicon_url: string | null;
  banner_url: string | null;
  users_count: number;
  notes_count: number;
  is_alive: boolean;
  is_verified: boolean;
  open_registrations: boolean | null;
  email_required: boolean | null;
  description: string | null;
  created_at: number | null;
  last_updated: number | null;
  last_check_at: number | null;
  recommendation_score: number | null;
  language: string | null;
}

interface InstancesResponse {
  items: Instance[];
  total: number;
  limit: number;
  offset: number;
}

interface StatsResponse {
  counts: {
    known: number;
    active: number;
    denies: number;
    ignores: number;
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

interface DenyInstance {
  domain: string;
  reason: string | null;
}

interface IgnoreInstance {
  domain: string;
  reason: string | null;
}
