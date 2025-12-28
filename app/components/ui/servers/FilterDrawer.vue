<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/60 z-50" @click="emit('close')"></div>
    </Transition>

    <Transition name="slide">
      <div v-if="isOpen"
        class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-back dark:bg-back-dark z-50 overflow-y-auto scrollbar-hide">
        <!-- Header -->
        <div class="sticky top-0 flex items-center justify-between px-6 py-4 bg-neutral-50 dark:bg-neutral-900">
          <h2 class="text-lg font-medium text-neutral-900 dark:text-white tracking-wide">FILTERS</h2>
          <BaseButton variant="icon" @click="emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </BaseButton>
        </div>

        <div class="p-6 space-y-4">
          <!-- Result count -->
          <div class="flex items-baseline justify-center gap-2 py-2">
            <p class="text-3xl font-bold text-primary">{{ totalCount }}</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">servers</p>
          </div>

          <div>
            <label
              class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">
              検索
            </label>
            <div class="flex">
              <BaseInput type="search" v-model="localQuery" placeholder="サーバー名..." class="flex-1" size="sm" />
              <button @click="applySearch"
                class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-white hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label
              class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">
              並び替え
            </label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <select v-model="localOrderBy"
                  class="w-full px-3 py-2 bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none text-xs">
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    value="recommendedScore">おすすめ順</option>
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" value="usersCount">
                    ユーザー数順</option>
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" value="notesCount">ノート数順
                  </option>
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" value="createdAt">登録日順
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button @click="toggleOrder" :title="localOrder === 'desc' ? '降順' : '昇順'"
                class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-white hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
                <svg v-if="localOrder === 'desc'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label
              class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">ステータス</label>
            <BaseSegmentedControl v-model="localOpenRegistrations" :options="registrationOptions" />
          </div>

          <div>
            <label
              class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">ユーザー数</label>
            <div class="space-y-2">
              <div>
                <div class="flex w-full isolate">
                  <button type="button"
                    class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center -ml-px first:ml-0 focus:z-10 focus:outline-none focus:ring-2 focus:ring-neutral-400 relative"
                    :class="userCountPreset === 'all'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 border-b border-b-neutral-200 dark:border-b-neutral-700 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                    @click="setUserCountPreset('all')">
                    すべて
                  </button>
                  <button type="button"
                    class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-neutral-400 relative"
                    :class="userCountPreset === 'small'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 border-b border-b-neutral-200 dark:border-b-neutral-700 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                    @click="setUserCountPreset('small')">
                    小規模
                  </button>
                  <button type="button"
                    class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-neutral-400 relative"
                    :class="userCountPreset === 'medium'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 border-b border-b-neutral-200 dark:border-b-neutral-700 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                    @click="setUserCountPreset('medium')">
                    中規模
                  </button>
                  <button type="button"
                    class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-neutral-400 relative"
                    :class="userCountPreset === 'large'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 border-b border-b-neutral-200 dark:border-b-neutral-700 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800'"
                    @click="setUserCountPreset('large')">
                    大規模
                  </button>
                </div>
                <div
                  class="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border-x border-b border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400 text-center -mt-px relative z-0">
                  {{ userCountDescription }}
                </div>
              </div>

              <details class="group">
                <summary
                  class="text-xs text-neutral-500 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors flex items-center gap-1 select-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-open:rotate-90"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  カスタム範囲
                </summary>
                <div class="mt-2 pl-2">
                  <div class="flex items-center space-x-2">
                    <BaseInput type="number" v-model="minUsersValue" min="0" step="1" placeholder="最小" size="sm" />
                    <span class="text-neutral-500">~</span>
                    <BaseInput type="number" v-model="maxUsersValue" min="0" step="1" placeholder="最大" size="sm" />
                  </div>
                </div>
              </details>
            </div>
          </div>

          <button type="button" @click="showDetails = !showDetails"
            class="flex items-center justify-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors border-none w-full py-2 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200"
              :class="showDetails ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            {{ showDetails ? '詳細検索' : '詳細検索' }}
          </button>

          <div v-show="showDetails" class="space-y-4 pt-2">
            <div>
              <label
                class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">メールアドレス</label>
              <BaseSegmentedControl v-model="localEmailRequired" :options="emailOptions" />
            </div>
            <div>
              <label
                class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                ソフトウェア (Repository)
              </label>
              <div class="relative">
                <select v-model="localRepository"
                  class="w-full px-3 py-2 bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none text-xs">
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" value="">すべてのソフトウェア
                  </option>
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    v-for="repo in repositories" :key="repo.url" :value="repo.url">
                    {{ (repo.name || 'Unknown').toUpperCase() }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label
                class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-1">
                言語
              </label>
              <div class="relative">
                <select v-model="localLanguage"
                  class="w-full px-3 py-2 bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none text-xs">
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white" value="">すべての言語</option>
                  <option class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                    v-for="lang in languages" :key="lang.code" :value="lang.code">
                    {{ getLanguageName(lang.code) }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-xs text-neutral-500">* 自動検出された言語</p>
            </div>
          </div>

        </div>

        <div class="sticky bottom-0 p-6 bg-neutral-50 dark:bg-neutral-900">
          <div class="flex gap-3">
            <BaseButton variant="secondary" @click="resetFilters" class="flex-1">
              リセット
            </BaseButton>
            <BaseButton @click="applyAndClose" class="flex-1">
              適用
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SortField, SortOrder } from '~/types/filters';

const registrationOptions = [
  { label: 'すべて', value: null },
  { label: '開放中', value: true },
  { label: '閉鎖中', value: false }
];

const emailOptions = [
  { label: 'すべて', value: null },
  { label: '任意', value: false },
  { label: '必須', value: true }
];

const props = defineProps<{
  isOpen: boolean;
  totalCount: string;
  searchQuery: string;
  orderBy: SortField;
  order: SortOrder;
  languageFilter: string;
  languages?: { code: string; count: number }[];
  repositories?: { url: string; name: string; count?: number }[];
  repositoryFilter: string;
  openRegistrations?: boolean | null;
  emailRequired?: boolean | null;
  minUsers?: number | null;
  maxUsers?: number | null;
}>();

const emit = defineEmits<{
  'close': [];
  'search': [query: string];
  'update:orderBy': [value: SortField];
  'update:order': [value: SortOrder];
  'update:languageFilter': [value: string];
  'update:repositoryFilter': [value: string];
  'update:openRegistrations': [value: boolean | null];
  'update:emailRequired': [value: boolean | null];
  'update:minUsers': [value: number | null];
  'update:maxUsers': [value: number | null];
  'reset': [];
}>();

const getLanguageName = (code: string) => {
  try {
    const name = new Intl.DisplayNames(['ja'], { type: 'language' }).of(code);
    if (name && name !== code) {
      return name;
    }
  } catch {
    // ignore
  }
  return code;
};

const localQuery = ref(props.searchQuery);
const showDetails = ref(false);

watch(() => props.searchQuery, (val) => {
  localQuery.value = val;
});

watch(() => props.isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

const localOrderBy = ref(props.orderBy);
const localOrder = ref(props.order);
const localLanguage = ref(props.languageFilter);
const localRepository = ref(props.repositoryFilter);
const localOpenRegistrations = ref(props.openRegistrations ?? null);
const localEmailRequired = ref(props.emailRequired ?? null);
const localMinUsers = ref(props.minUsers ?? null);
const localMaxUsers = ref(props.maxUsers ?? null);

// Sync props to local refs
watch(() => props.orderBy, (val) => localOrderBy.value = val);
watch(() => props.order, (val) => localOrder.value = val);
watch(() => props.languageFilter, (val) => localLanguage.value = val);
watch(() => props.repositoryFilter, (val) => localRepository.value = val);
watch(() => props.openRegistrations, (val) => localOpenRegistrations.value = val ?? null);
watch(() => props.emailRequired, (val) => localEmailRequired.value = val ?? null);
watch(() => props.minUsers, (val) => localMinUsers.value = val ?? null);
watch(() => props.maxUsers, (val) => localMaxUsers.value = val ?? null);

// Sync local refs to emits
watch(localOrderBy, (val) => emit('update:orderBy', val));
watch(localOrder, (val) => emit('update:order', val));

watch(localLanguage, (val) => {
  if (val !== props.languageFilter) emit('update:languageFilter', val);
});
watch(localRepository, (val) => {
  if (val !== props.repositoryFilter) emit('update:repositoryFilter', val);
});
watch(localOpenRegistrations, (val) => {
  if (val !== (props.openRegistrations ?? null)) emit('update:openRegistrations', val);
});
watch(localEmailRequired, (val) => {
  if (val !== (props.emailRequired ?? null)) emit('update:emailRequired', val);
});
// Min/Max users handled via preset or direct input, which should bind to localMinUsers refs

const minUsersValue = computed({
  get: () => localMinUsers.value,
  set: (val: number | string | null) => {
    const v = val === '' ? null : val as number | null;
    localMinUsers.value = v;
    emit('update:minUsers', v);
  }
});
const maxUsersValue = computed({
  get: () => localMaxUsers.value,
  set: (val: number | string | null) => {
    const v = val === '' ? null : val as number | null;
    localMaxUsers.value = v;
    emit('update:maxUsers', v);
  }
});

// Computed wrappers for v-model binding if we want to keep template simple or bind directly to local refs
// We will replace usage in template to point to the local refs.


type UserPreset = 'all' | 'small' | 'medium' | 'large' | 'custom';
const userCountPreset = ref<UserPreset>('all');

const userCountDescription = computed(() => {
  switch (userCountPreset.value) {
    case 'small': return '100人以下';
    case 'medium': return '100 ~ 5,000人';
    case 'large': return '5,000人以上';
    case 'custom': return 'カスタム指定';
    default: return 'すべての規模';
  }
});

function setUserCountPreset(preset: UserPreset) {
  userCountPreset.value = preset;
  switch (preset) {
    case 'small':
      emit('update:minUsers', null);
      emit('update:maxUsers', 100);
      break;
    case 'medium':
      emit('update:minUsers', 101);
      emit('update:maxUsers', 5000);
      break;
    case 'large':
      emit('update:minUsers', 5001);
      emit('update:maxUsers', null);
      break;
    case 'all':
      emit('update:minUsers', null);
      emit('update:maxUsers', null);
      break;
  }
}

function checkCustomPreset() {
  userCountPreset.value = 'custom';
}

watch([() => props.minUsers, () => props.maxUsers], ([min, max]) => {
  if (min === null && max === null) {
    userCountPreset.value = 'all';
  } else if (min === null && max === 100) {
    userCountPreset.value = 'small';
  } else if (min === 101 && max === 5000) {
    userCountPreset.value = 'medium';
  } else if (min === 5001 && max === null) {
    userCountPreset.value = 'large';
  } else {
    userCountPreset.value = 'custom';
  }
}, { immediate: true });

function toggleOrder() {
  localOrder.value = localOrder.value === 'asc' ? 'desc' : 'asc';
}

function applySearch() {
  emit('search', localQuery.value.toLowerCase());
}

function resetFilters() {
  localQuery.value = '';
  emit('reset');
}

function applyAndClose() {
  applySearch();
  emit('close');
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
