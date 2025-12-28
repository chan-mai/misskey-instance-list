export interface Instance {
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
  user_count: number;
  users_count: number;
  notes_count: number;
  is_alive: boolean;
  is_verified: boolean;
  registration_open: boolean;
  email_required: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  last_updated: string | null;
  last_check_at: string | null;
  recommendation_score: number;
  language: string | null;
}

export interface InstancesResponse {
  items: Instance[];
  total: number;
  limit: number;
  offset: number;
}

export interface StatsResponse {
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

export interface ModalItem {
  domain: string;
  reason: string | null;
}
