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
