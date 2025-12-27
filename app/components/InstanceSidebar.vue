<template>
  <aside
    class="sticky top-16 z-40 lg:static lg:z-auto
           -mx-6 w-[calc(100%+3rem)] lg:w-full lg:mx-0
           bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none
           border-b border-black/5 dark:border-white/10 lg:border-none transition-all duration-300"
  >
    <!-- Toggle Button (Mobile Only) -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-6 py-4 lg:hidden text-left border-none focus:outline-none group"
    >
      <div class="flex items-center gap-3 text-slate-700 dark:text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="font-medium text-sm tracking-wide">検索・ソート</span>
        
        <span v-if="searchQuery" class="flex relative w-2.5 h-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
        </span>
      </div>
      
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="w-4 h-4 text-slate-400 dark:text-slate-600 transition-transform duration-300 ease-out"
        :class="isOpen ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <!-- Content Area -->
    <div 
      class="lg:block lg:sticky lg:top-24 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)] lg:py-2"
      :class="isOpen ? 'block border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-900 max-h-[80vh] overflow-y-auto' : 'hidden'"
    >
       <div class="space-y-6 lg:space-y-4">
         <!-- Desktop Header -->
         <div class="hidden lg:flex items-center">
            <h3 class="text-xl font-bold">検索・ソート</h3>
         </div>

        <!-- 検索フォーム -->
        <form @submit.prevent="applyQuery">
          <label class="form-label block text-sm font-medium mb-1" for="query">検索</label>
          <div class="flex">
            <input 
              class="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-xs min-w-0" 
              type="search" 
              autocomplete="off" 
              id="query" 
              v-model="queryPartial"
              placeholder="サーバー名で検索"
            />
            <button type="submit" class="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/60 border border-l-0 border-slate-300 dark:border-slate-600 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <!-- 並び順 -->
        <div>
          <label class="form-label block text-sm font-medium mb-1" for="orderBy">並び順</label>
          <div class="flex">
            <select id="orderBy" v-model="orderByValue" class="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-xs min-w-0">
              <option value="recommendedScore">おすすめ順</option>
              <option value="usersCount">ユーザー数</option>
              <option value="notesCount">ノート数</option>
              <option value="createdAt">初観測日</option>
            </select>
            <button class="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/60 border border-l-0 border-slate-300 dark:border-slate-600 flex-shrink-0" @click="switchOrder">
              <svg v-if="orderValue === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- リポジトリフィルタ -->
        <div class="mb-6">
          <label class="form-label block text-sm font-medium mb-1" for="repository">ソフトウェア</label>
          <div class="relative">
            <select 
              id="repository" 
              v-model="repositoryPartial"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 appearance-none text-xs"
            >
              <option value="">すべてのソフトウェア</option>
              <option 
                v-for="repo in repositories" 
                :key="repo.url" 
                :value="repo.url"
              >
                {{ repo.name || repo.url }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 言語フィルタ -->
        <div class="mb-6">
          <label class="form-label block text-sm font-medium mb-1" for="language">言語</label>
          <div class="relative">
            <select 
              id="language" 
              v-model="languagePartial"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 appearance-none text-xs"
            >
              <option value="">すべての言語</option>
              <option 
                v-for="lang in languages" 
                :key="lang.code" 
                :value="lang.code"
              >
                {{ getLanguageName(lang.code) }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">※ 自動検出のため、実際の主要言語と異なる場合があります</p>
        </div>
        
        <!-- 登録ポリシフィルタ -->
        <div class="mb-6">
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-slate-500 mb-1">新規登録</label>
              <div class="flex w-full isolate">
                <button
                  type="button"
                  class="flex-1 w-0 px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center first:rounded-l-lg last:rounded-r-lg -ml-px first:ml-0 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="openRegistrationsValue === null 
                    ? 'bg-primary/10 text-primary border-primary/50' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="openRegistrationsValue = null"
                >
                  すべて
                </button>
                <button
                  type="button"
                  class="flex-1 w-0 px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="openRegistrationsValue === true 
                    ? 'bg-primary/10 text-primary border-primary/50' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="openRegistrationsValue = true"
                >
                  開放中
                </button>
                <button
                  type="button"
                  class="flex-1 w-0 px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center first:rounded-l-lg last:rounded-r-lg -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="openRegistrationsValue === false 
                    ? 'bg-primary/10 text-primary border-primary/50' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="openRegistrationsValue = false"
                >
                  閉鎖中
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs text-slate-500 mb-1">メールアドレス</label>
              <div class="flex w-full isolate">
                <button
                  type="button"
                  class="flex-1 px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center first:rounded-l-lg last:rounded-r-lg -ml-px first:ml-0 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="emailRequiredValue === null 
                    ? 'bg-primary/10 text-primary border-primary/50' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="emailRequiredValue = null"
                >
                  すべて
                </button>
                <button
                  type="button"
                  class="flex-1 w-0 px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="emailRequiredValue === false 
                    ? 'bg-primary/10 text-primary border-primary/50' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="emailRequiredValue = false"
                >
                  不要
                </button>
                <button
                  type="button"
                  class="flex-1 w-0 px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center first:rounded-l-lg last:rounded-r-lg -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  :class="emailRequiredValue === true 
                    ? 'bg-primary/10 text-primary border-primary/50' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="emailRequiredValue = true"
                >
                  必須
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ユーザー数フィルタ -->
        <div class="mb-6">
          <label class="form-label block text-sm font-medium mb-2">ユーザー数</label>
          <div class="space-y-4">
            <div>
              <div class="flex w-full isolate">
                <button
                  type="button"
                  class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center first:rounded-tl-lg -ml-px first:ml-0 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40 relative"
                  :class="userCountPreset === 'all'
                    ? 'bg-primary/10 text-primary border-primary/50 border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 border-b border-b-primary/50 py-2 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="setUserCountPreset('all')"
                >
                  すべて
                </button>
                <button
                  type="button"
                  class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40 relative"
                  :class="userCountPreset === 'small'
                    ? 'bg-primary/10 text-primary border-primary/50 border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 border-b border-b-primary/50 py-2 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="setUserCountPreset('small')"
                >
                  小規模
                </button>
                <button
                  type="button"
                  class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40 relative"
                  :class="userCountPreset === 'medium'
                    ? 'bg-primary/10 text-primary border-primary/50 border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 border-b border-b-primary/50 py-2 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="setUserCountPreset('medium')"
                >
                  中規模
                </button>
                <button
                  type="button"
                  class="flex-1 w-0 px-3 text-xs font-medium border-t border-x transition-colors flex items-center justify-center last:rounded-tr-lg -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary/40 relative"
                  :class="userCountPreset === 'large'
                    ? 'bg-primary/10 text-primary border-primary/50 border-b-0 z-10 pt-2 pb-[calc(0.5rem+1px)]' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 border-b border-b-primary/50 py-2 hover:bg-slate-50 dark:hover:bg-slate-700'"
                  @click="setUserCountPreset('large')"
                >
                  大規模
                </button>
              </div>
              <div class="px-3 py-2 bg-primary/10 border-x border-b border-primary/50 rounded-b-lg text-xs text-primary text-center -mt-px relative z-0">
                {{ userCountDescription }}
              </div>
            </div>

            <details class="group">
              <summary class="text-xs text-slate-500 cursor-pointer hover:text-primary transition-colors flex items-center gap-1 select-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                詳細な数値を指定
              </summary>
              <div class="mt-2 pl-2">
                <div class="flex items-center space-x-2">
                  <input 
                    type="number" 
                    v-model="minUsersValue"
                    min="0"
                    step="1"
                    placeholder="最小"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-xs"
                    @input="checkCustomPreset"
                  >
                  <span class="text-slate-500">~</span>
                  <input 
                    type="number" 
                    v-model="maxUsersValue"
                    min="0"
                    step="1"
                    placeholder="最大"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-xs"
                    @input="checkCustomPreset"
                  >
                </div>
              </div>
            </details>
          </div>
        </div>

        <!-- 表示 -->
        <div>
          <h3 class="lg:pt-2 text-xl font-bold mb-2">表示</h3>
          <div class="flex w-full" role="group">
            <input type="radio" class="hidden" name="btnradio" id="btnradio1" autocomplete="off" value="grid" v-model="viewValue">
            <label 
              class="flex-1 px-4 py-2 text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors"
              :class="viewValue === 'grid' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'"
              style="border-radius: 0.5rem 0 0 0.5rem;"
              for="btnradio1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              グリッド
            </label>
            
            <input type="radio" class="hidden" name="btnradio" id="btnradio2" autocomplete="off" value="list" v-model="viewValue">
            <label 
              class="flex-1 px-4 py-2 text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors"
              :class="viewValue === 'list' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'"
              style="border-radius: 0 0.5rem 0.5rem 0;"
              for="btnradio2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              リスト
            </label>
          </div>
        </div>
  
        <!-- 統計情報 -->
        <div class="pt-4 border-t border-slate-300 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          {{ loading ? 'Loading...' : `${totalCount} instances` }}
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
  totalCount: string;
  searchQuery: string;
  repositoryFilter: string;
  repositories?: { url: string; name: string | null; count: number }[];
  languageFilter: string;
  languages?: { code: string; count: number }[];
  orderBy: 'recommendedScore' | 'notesCount' | 'usersCount' | 'createdAt';
  order: 'asc' | 'desc';
  view: 'grid' | 'list';
  openRegistrations: boolean | null;
  emailRequired: boolean | null;
  minUsers: number | null;
  maxUsers: number | null;
}>();

const emit = defineEmits<{
  search: [query: string];
  'update:repositoryFilter': [value: string];
  'update:languageFilter': [value: string];
  'update:orderBy': [value: 'recommendedScore' | 'notesCount' | 'usersCount' | 'createdAt'];
  'update:order': [value: 'asc' | 'desc'];
  'update:view': [value: 'grid' | 'list'];
  'update:openRegistrations': [value: boolean | null];
  'update:emailRequired': [value: boolean | null];
  'update:minUsers': [value: number | null];
  'update:maxUsers': [value: number | null];
}>();

const isOpen = ref(false);
const queryPartial = ref(props.searchQuery);
const repositoryPartial = ref(props.repositoryFilter);
const languagePartial = ref(props.languageFilter);

watch(() => props.searchQuery, (newVal) => {
  queryPartial.value = newVal;
});

watch(() => props.repositoryFilter, (newVal) => {
  repositoryPartial.value = newVal;
});

watch(() => props.languageFilter, (newVal) => {
  languagePartial.value = newVal;
});

watch(repositoryPartial, (newVal) => {
  if (newVal !== props.repositoryFilter) {
    emit('update:repositoryFilter', newVal);
  }
});

watch(languagePartial, (newVal) => {
  if (newVal !== props.languageFilter) {
    emit('update:languageFilter', newVal);
  }
});

const orderByValue = computed({
  get: () => props.orderBy,
  set: (val) => emit('update:orderBy', val)
});

const orderValue = computed({
  get: () => props.order,
  set: (val) => emit('update:order', val)
});

const viewValue = computed({
  get: () => props.view,
  set: (val) => emit('update:view', val)
});

const openRegistrationsValue = computed({
  get: () => props.openRegistrations,
  set: (val) => emit('update:openRegistrations', val)
});

const emailRequiredValue = computed({
  get: () => props.emailRequired,
  set: (val) => emit('update:emailRequired', val)
});

const minUsersValue = computed({
  get: () => props.minUsers,
  set: (val: number | string | null) => emit('update:minUsers', val === '' ? null : val as number | null)
});

const maxUsersValue = computed({
  get: () => props.maxUsers,
  set: (val: number | string | null) => emit('update:maxUsers', val === '' ? null : val as number | null)
});

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

// Watch props to update preset if values change externally or on load
watch([() => props.minUsers, () => props.maxUsers], ([min, max]) => {
  // Prevent infinite loop or overriding manual selection logic if values match presets
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

function getLanguageName(code: string) {
  try {
    // detectLanguage now returns ISO 639-1 directly
    const name = new Intl.DisplayNames(code, { type: 'language' }).of(code);
    if (name && name !== code) {
      return `${name} (${code})`;
    }
  } catch {
    // ignore
  }
  return code;
}

function applyQuery() {
  isOpen.value = false;
  emit('search', queryPartial.value.toLowerCase());
}

function switchOrder() {
  emit('update:order', props.order === 'asc' ? 'desc' : 'asc');
}
</script>
