export type SortField = 'recommendedScore' | 'notesCount' | 'usersCount' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface FilterSettings {
  query: string;
  repository: string;
  language: string;
  orderBy: SortField;
  order: SortOrder;
}
