export type FilterOrderBy = 'recommendedScore' | 'notesCount' | 'usersCount' | 'createdAt';
export type FilterOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';

export interface FilterSettings {
  f_orderBy: FilterOrderBy;
  f_order: FilterOrder;
  v_view: ViewMode;
  f_openRegistrations?: boolean | null;
  f_emailRequired?: boolean | null;
  f_minUsers?: number | null;
  f_maxUsers?: number | null;
}

export const STORAGE_KEY = 'miHub_server_finder';
