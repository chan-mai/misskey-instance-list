<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Crawl</h1>

    <div class="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4">
      <p class="text-gray-600 dark:text-gray-400">
        インスタンスを指名して即時クロールします。定期実行のupdateタスクを待たずに反映したい場合に使います。未登録のドメインはこの操作で新規登録されます。
      </p>

      <form @submit.prevent="run" class="flex flex-col sm:flex-row gap-3">
        <input
          v-model="domain"
          type="text"
          placeholder="misskey.io"
          autocomplete="off"
          spellcheck="false"
          :disabled="pending"
          class="flex-1 font-mono bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow disabled:opacity-50"
        />
        <button
          type="submit"
          :disabled="pending || !domain.trim()"
          class="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white border-none px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          <Icon :name="pending ? 'lucide:loader-circle' : 'lucide:radar'" class="size-4" :class="{ 'animate-spin': pending }" />
          {{ pending ? 'クロール中...' : 'クロール' }}
        </button>
      </form>

      <p v-if="pending" class="text-xs text-gray-500">
        応答が無いインスタンスではタイムアウトまで1分ほどかかることがあります。
      </p>
    </div>

    <!-- エラー -->
    <div
      v-if="errorMessage"
      class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg"
    >
      {{ errorMessage }}
    </div>

    <!-- 結果 -->
    <div
      v-if="result"
      class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
    >
      <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Icon
          :name="result.ok ? 'lucide:circle-check' : 'lucide:circle-alert'"
          class="w-5 h-5"
          :class="result.ok ? 'text-green-500' : 'text-red-500'"
        />
        <span class="font-mono">{{ result.domain }}</span>
        <span
          v-if="result.created"
          class="px-2 py-0.5 rounded text-xs border bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
        >
          新規登録
        </span>
        <span v-if="!result.ok" class="text-xs text-red-500">
          取得失敗{{ result.error ? ` (${result.error})` : '' }}
        </span>
      </div>

      <table class="w-full text-left">
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <tr v-for="row in resultRows" :key="row.label">
            <th class="px-4 py-3 font-medium w-48 align-top">{{ row.label }}</th>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400 break-all">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

type CrawlResult = {
  domain: string;
  ok: boolean;
  error: string | null;
  created: boolean;
  instance: {
    id: string;
    node_name: string | null;
    version: string | null;
    users_count: number | null;
    notes_count: number | null;
    is_alive: boolean;
    suspension_state: string;
    language: string | null;
    repository_url: string | null;
    last_check_at: string | null;
  } | null;
};

const domain = ref('');
const pending = ref(false);
const result = ref<CrawlResult | null>(null);
const errorMessage = ref('');

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(num);
};

const resultRows = computed(() => {
  const instance = result.value?.instance;
  if (!instance) return [];

  return [
    { label: '名前', value: instance.node_name || '-' },
    { label: 'バージョン', value: instance.version || '-' },
    { label: 'ユーザー数', value: formatNumber(instance.users_count) },
    { label: 'ノート数', value: formatNumber(instance.notes_count) },
    { label: '生存', value: instance.is_alive ? 'alive' : 'dead' },
    { label: '停止状態', value: instance.suspension_state },
    { label: '言語', value: instance.language || '-' },
    { label: 'リポジトリ', value: instance.repository_url || '-' },
    {
      label: '最終チェック',
      value: instance.last_check_at ? new Date(instance.last_check_at).toLocaleString() : '-',
    },
  ];
});

const run = async() => {
  if (pending.value) return;

  pending.value = true;
  errorMessage.value = '';
  result.value = null;

  try {
    result.value = await $fetch<CrawlResult>('/api/admin/crawl', {
      method: 'POST',
      body: { domain: domain.value.trim() },
    });
  } catch (e: unknown) {
    const err = e as { statusMessage?: string; message?: string };
    errorMessage.value = err.statusMessage || err.message || 'クロールに失敗しました';
  } finally {
    pending.value = false;
  }
};
</script>
