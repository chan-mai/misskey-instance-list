import type { SortField, SortOrder, FilterSettings } from '~/types/filters';
import type { InstancesResponse } from '~/types/api';
import { PAGE_SIZE, STORAGE_KEY, SORT_API_MAP } from '~/utils/constants';

export const useInstances = () => {
  // Saved settings
  const savedSettings = import.meta.client 
    ? JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<FilterSettings> | null
    : null;

  // State
  const instances = ref<Instance[]>([]);
  const total = ref(0);
  const offset = ref(0);
  const isLoading = ref(false);
  const initialLoading = ref(true);
  const errorMessage = ref<string | null>(null);

  // Filter state
  const filters = reactive<FilterSettings>({
    query: '',
    repository: '',
    language: '',
    orderBy: (savedSettings?.orderBy as SortField) ?? 'recommendedScore',
    order: (savedSettings?.order as SortOrder) ?? 'desc'
  });

  // Computed
  const hasMore = computed(() => offset.value + instances.value.length < total.value);
  const sortApiValue = computed(() => SORT_API_MAP[filters.orderBy] ?? 'users');

  const activeFiltersCount = computed(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.language) count++;
    if (filters.orderBy !== 'recommendedScore') count++;
    return count;
  });

  // Persist settings
  watch(
    () => [filters.orderBy, filters.order],
    ([orderBy, order]) => {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ orderBy, order }));
      }
    }
  );

  // API
  async function fetchInstances(reset = false) {
    if (isLoading.value) return;
    
    isLoading.value = true;
    errorMessage.value = null;
    
    if (reset) {
      initialLoading.value = true;
      instances.value = [];
    }
    
    try {
      const currentOffset = reset ? 0 : offset.value;
      const params = new URLSearchParams({
        sort: sortApiValue.value,
        order: filters.order,
        limit: PAGE_SIZE.toString(),
        offset: currentOffset.toString(),
      });
      
      if (filters.query) params.set('search', filters.query);
      if (filters.repository) params.set('repository', filters.repository);
      if (filters.language) params.set('language', filters.language);
      
      const response = await $fetch<InstancesResponse>(`/api/v1/instances?${params}`);
      
      if (reset) {
        instances.value = response.items;
        offset.value = response.limit;
      } else {
        instances.value.push(...response.items);
        offset.value = currentOffset + response.limit;
      }
      total.value = response.total;
    } catch (e) {
      errorMessage.value = e instanceof Error ? e.message : 'Failed to load instances';
    } finally {
      isLoading.value = false;
      initialLoading.value = false;
    }
  }

  // Watchers
  watch(() => [filters.orderBy, filters.order], () => fetchInstances(true));

  return {
    instances,
    total,
    isLoading,
    initialLoading,
    errorMessage,
    hasMore,
    filters,
    activeFiltersCount,
    fetchInstances
  };
};
