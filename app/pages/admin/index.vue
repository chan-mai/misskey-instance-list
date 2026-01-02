<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
      failed to fetch stats: {{ error.message }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Active Instances -->
      <div class="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div class="text-sm text-gray-500 mb-1">Active / Known Instances</div>
        <div class="text-2xl font-bold">
          <span v-if="pending" class="animate-pulse bg-gray-200 dark:bg-gray-800 rounded w-16 h-8 inline-block"></span>
          <span v-else>{{ formatNumber(data?.instances.active) }} / {{ formatNumber(data?.instances.known) }}</span>
        </div>
      </div>

      <!-- Users -->
      <div class="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <div class="text-sm text-gray-500 mb-1">Total Users</div>
        <div class="text-2xl font-bold">
          <span v-if="pending" class="animate-pulse bg-gray-200 dark:bg-gray-800 rounded w-16 h-8 inline-block"></span>
          <span v-else>{{ formatNumber(data?.users) }}</span>
        </div>
      </div>

      <!-- Exclusions -->
      <div class="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 md:col-span-2">
        <div class="text-sm text-gray-500 mb-2">Excluded Hosts</div>
        <div class="flex items-end gap-4">
           <div class="text-2xl font-bold">
            <span v-if="pending" class="animate-pulse bg-gray-200 dark:bg-gray-800 rounded w-16 h-8 inline-block"></span>
            <span v-else>{{ formatNumber(data?.exclusions.total) }}</span>
           </div>
           <div class="flex gap-3 text-xs text-gray-500 pb-1" v-if="!pending && data">
             <span class="flex items-center gap-1">
               <div class="w-2 h-2 rounded-full bg-blue-500"></div>
               Manual: {{ formatNumber(data.exclusions.manual) }}
             </span>
             <span class="flex items-center gap-1">
               <div class="w-2 h-2 rounded-full bg-red-500"></div>
               System: {{ formatNumber(data.exclusions.system) }}
             </span>
             <span class="flex items-center gap-1">
               <div class="w-2 h-2 rounded-full bg-green-500"></div>
               JoinMisskey: {{ formatNumber(data.exclusions.joinmisskey) }}
             </span>
           </div>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <p class="text-gray-600 dark:text-gray-400">
        管理コンソールへようこそ。サーバーの統計情報や設定をここで確認・管理できます。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
});

const { data, pending, error } = await useFetch('/api/admin/stats');

const formatNumber = (num: number | undefined) => {
  if (num === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(num);
};
</script>
