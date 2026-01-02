<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Excluded Hosts</h1>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white border-none px-4 py-2 rounded-lg font-bold transition-colors"
      >
        <Icon name="lucide:plus" class="size-4" />Add
      </button>
    </div>

    <!-- フィルタ -->
    <div class="flex gap-4 items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
      <div class="flex-1">
        <input
          v-model="search"
          type="text"
          placeholder="ドメインまたは理由で検索..."
          class="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
          @input="debouncedSearch"
        />
      </div>
      <div class="w-48">
        <select
          v-model="sourceFilter"
          class="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
        >
          <option value="manual">Manual</option>
          <option value="system">System</option>
          <option value="joinmisskey">JoinMisskey</option>
          <option value="all">すべて</option>
        </select>
      </div>
    </div>

    <!-- テーブル -->
    <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th class="px-4 py-3 font-medium">ドメイン</th>
            <th class="px-4 py-3 font-medium">理由</th>
            <th class="px-4 py-3 font-medium">ソース</th>
            <th class="px-4 py-3 font-medium">登録</th>
            <th class="px-4 py-3 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <tr v-if="pending" class="animate-pulse">
            <td colspan="5" class="px-4 py-8 text-center text-gray-500">読み込み中...</td>
          </tr>
          <tr v-else-if="error">
             <td colspan="5" class="px-4 py-8 text-center text-red-500">
               データの読み込みに失敗しました。認証が必要かもしれません。
               <button @click="() => refresh()" class="underline border-none ml-2">再試行</button>
             </td>
          </tr>
          <tr v-else-if="!data?.exclusions.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-500">除外ホストは見つかりませんでした</td>
          </tr>
          <tr v-else v-for="item in data.exclusions" :key="item.domain" class="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
            <td class="px-4 py-3 font-mono">{{ item.domain }}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ item.reason || '-' }}</td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-0.5 rounded text-xs border"
                :class="{
                  'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300': item.source === 'manual',
                  'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300': item.source === 'system',
                  'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300': item.source === 'joinmisskey',
                }"
              >
                {{ item.source }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
              {{ new Date(item.created_at).toLocaleString() }}
            </td>
            <td class="px-4 py-3 text-right">
              <div v-if="item.source === 'manual'" class="flex justify-end gap-2">
                <button
                  @click="editItem(item)"
                  class="p-2 text-primary border-none hover:bg-primary/10 rounded-lg transition-colors"
                  title="編集"
                >
                  <Icon name="lucide:pencil" class="w-5 h-5" />
                </button>
                <button
                  @click="deleteItem(item)"
                  class="p-2 text-red-500 border-none hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="削除"
                >
                  <Icon name="lucide:trash-2" class="w-5 h-5" />
                </button>
              </div>
              <span v-else class="text-xs text-gray-400 dark:text-gray-600">
                操作不可
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ページネーション -->
    <div class="flex justify-center gap-2" v-if="data && data.total > limit">
      <button
        :disabled="page <= 1"
        @click="page--"
        class="px-3 py-1 border-none bg-primary hover:bg-primary/80 text-white rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span class="px-3 py-1">{{ page }}</span>
      <button
        :disabled="page * limit >= data.total"
        @click="page++"
        class="px-3 py-1 border-none bg-primary hover:bg-primary/80 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <!-- モーダル (簡易実装) -->
    <Teleport to="body">
      <dialog
        v-if="showModal"
        ref="dialogRef"
        class="bg-white dark:bg-back-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl backdrop:bg-black/50"
        @close="closeModal"
      >
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? '除外理由の編集' : '除外ホストの追加' }}</h2>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-bold mb-1">ドメイン</label>
            <input
              v-model="form.domain"
              :disabled="isEditing"
              type="text"
              required
              class="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded px-3 py-2 disabled:opacity-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
              placeholder="example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-bold mb-1">理由</label>
            <textarea
              v-model="form.reason"
              class="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded px-3 py-2 h-24 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
              placeholder="除外する理由を入力してください..."
            ></textarea>
          </div>

          <div v-if="!isEditing">
             <label class="block text-sm font-bold mb-1">Source</label>
             <select
               v-model="form.source"
               class="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
             >
               <option value="manual">Manual</option>
               <option value="system">System</option>
               <option value="joinmisskey">JoinMisskey</option>
             </select>
          </div>

          <div v-if="formError" class="text-red-500 text-sm">
            {{ formError }}
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded border-none"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded border-none font-bold"
              :disabled="submitting"
            >
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const page = ref(1);
const limit = 20;
const search = ref('');
const sourceFilter = ref('all');
const debouncedSearchKey = ref('');

let timeout: NodeJS.Timeout;
const debouncedSearch = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    debouncedSearchKey.value = search.value;
    page.value = 1;
  }, 300);
};

// データ取得
const { data, pending, error, refresh } = await useFetch('/api/admin/exclusions', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: debouncedSearchKey.value,
    source: sourceFilter.value,
  })),
  onResponseError: (err) => {
    if (err.response.status === 401) {
      // ブラウザが認証プロンプトを出しますが、ここでUI状態を操作することも可能です
    }
  }
});

watch(sourceFilter, () => {
  page.value = 1;
});

// モーダルとフォームのロジック
const showModal = ref(false);
const dialogRef = ref<HTMLDialogElement | null>(null);
const isEditing = ref(false);
const submitting = ref(false);
const formError = ref('');
const form = reactive({
  domain: '',
  reason: '',
  source: 'manual'
});

const openAddModal = async () => {
  isEditing.value = false;
  form.domain = '';
  form.reason = '';
  form.source = 'manual';
  formError.value = '';
  showModal.value = true;
  await nextTick();
  dialogRef.value?.showModal();
};

const editItem = async (item: any) => {
  isEditing.value = true;
  form.domain = item.domain;
  form.reason = item.reason || '';
  form.source = item.source; // Not editable, but good for state
  formError.value = '';
  showModal.value = true;
  await nextTick();
  dialogRef.value?.showModal();
};

const closeModal = () => {
  dialogRef.value?.close();
  showModal.value = false;
};

const submitForm = async () => {
  submitting.value = true;
  formError.value = '';

  try {
    if (isEditing.value) {
      await $fetch(`/api/admin/exclusions/${form.domain}`, {
        method: 'PATCH',
        body: { reason: form.reason },
      });
    } else {
      await $fetch('/api/admin/exclusions', {
        method: 'POST',
        body: { ...form },
      });
    }
    closeModal();
    refresh();
  } catch (e: any) {
    formError.value = e.statusMessage || e.message || 'エラーが発生しました';
  } finally {
    submitting.value = false;
  }
};

const deleteItem = async (item: any) => {
  if (!confirm(`${item.domain} を削除してもよろしいですか？`)) return;
  
  try {
    await $fetch(`/api/admin/exclusions/${item.domain}`, {
      method: 'DELETE',
    });
    refresh();
  } catch (e: any) {
    alert(e.statusMessage || '削除に失敗しました');
  }
};
</script>
