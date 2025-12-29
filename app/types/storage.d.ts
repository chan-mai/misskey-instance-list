interface FilterSettings {
  f_orderBy: SortField;
  f_order: SortOrder;
  v_view: ViewMode;
  f_openRegistrations?: boolean | null;
  f_emailRequired?: boolean | null;
  f_minUsers?: number | null;
  f_maxUsers?: number | null;
}
