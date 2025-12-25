<template>
  <div class="min-h-screen bg-back dark:bg-[#0b1220]">
    <!-- Header Section -->
    <header class="min-h-screen flex flex-col justify-center relative py-24 overflow-hidden">
        <!-- 背景テキスト -->
        <div
            class="absolute right-0 top-1/4 text-[15vw] font-bold text-primary/70 opacity-30 pointer-events-none select-none leading-none whitespace-nowrap">
            NETWORK<br>STATS
        </div>

        <div class="container mx-auto max-w-screen-lg px-6 relative z-10">
            <p class="text-xs md:text-sm uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 font-medium mb-8">
                Network Statistics
            </p>

            <h1
                class="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-12 leading-tight">
                Network<br>Statistics
            </h1>

            <div class="w-16 md:w-24 h-0.5 bg-slate-900 dark:bg-white mb-12"></div>

            <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                ネットワーク全体の詳細な統計情報です。<br>
                アクティブなインスタンス数や、使用されているソフトウェアの分布などを確認できます。
            </p>
        </div>

        <!-- スクロール指示 -->
        <div class="absolute bottom-8 left-6 md:left-24 flex items-center gap-4 opacity-60 animate-bounce">
            <span class="text-[10px] uppercase tracking-widest dark:text-white">Scroll</span>
            <div class="w-px h-10 bg-slate-900 dark:bg-white"></div>
        </div>
    </header>

    <div v-if="pending" class="py-32 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-slate-500">Loading statistics...</p>
    </div>

    <div v-else-if="error" class="py-32 text-center">
      <div class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg inline-block">
        <h3 class="font-bold mb-2">Failed to load statistics</h3>
        <p>{{ error.message }}</p>
      </div>
    </div>

    <div v-else>
      <!-- Overview Section -->
      <section class="py-32 bg-white dark:bg-slate-900">
          <div class="container mx-auto max-w-screen-lg px-6">
              <div class="flex items-end justify-between mb-24 border-b border-primary/70 pb-6">
                  <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
                  <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">01 Overview</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                <!-- Active -->
                <div class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                  <div class="relative">
                    <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Active Servers</p>
                    <p class="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                      {{ formatNumber(stats?.counts?.active) }}
                    </p>
                    <p class="text-xs text-green-500 font-medium flex items-center">
                      <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                      Online & Healthy
                    </p>
                  </div>
                </div>

                <!-- Known -->
                <div class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                  <div class="relative">
                    <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total Known</p>
                    <p class="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                      {{ formatNumber(stats?.counts?.known) }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      All discovered instances
                    </p>
                  </div>
                </div>

                <!-- Denied -->
                <div class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                  <div class="relative">
                    <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Denied Domains</p>
                    <p class="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                      {{ formatNumber(stats?.counts?.denies) }}
                    </p>
                    <p class="text-xs text-red-500/70">Blocked</p>
                  </div>
                </div>

                <!-- Ignored -->
                <div class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-500/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                  <div class="relative">
                    <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Ignored Domains</p>
                    <p class="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                      {{ formatNumber(stats?.counts?.ignores) }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Excluded</p>
                  </div>
                </div>
              </div>
          </div>
      </section>

      <!-- Software Section -->
      <section class="py-32 bg-back dark:bg-[#0b1220]">
          <div class="container mx-auto max-w-screen-lg px-6">
              <div class="flex items-end justify-between mb-24 border-b border-primary/70 pb-6">
                  <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Software</h2>
                  <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">02 Distribution</span>
              </div>
              
              <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                      <tr>
                        <th class="px-6 py-5 font-bold whitespace-nowrap">Rank</th>
                        <th class="px-6 py-5 font-bold">Software / Repository</th>
                        <th class="px-6 py-5 font-bold text-right">Instances</th>
                        <th class="px-6 py-5 font-bold text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr v-for="(repo, index) in stats?.repositories" :key="repo.url" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td class="px-6 py-5 text-slate-500 dark:text-slate-400 font-mono font-bold whitespace-nowrap">
                          #{{ index + 1 }}
                        </td>
                        <td class="px-6 py-5">
                          <div class="flex items-start">
                            <div class="mr-3 mt-1 text-slate-400">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                 <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                               </svg>
                            </div>
                            <div>
                              <a :href="repo.url" target="_blank" rel="noopener noreferrer" class="font-bold text-lg text-slate-800 dark:text-slate-100 hover:text-primary transition-colors">
                                {{ repo.name || repo.url }}
                              </a>
                              <p v-if="repo.description" class="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-md">
                                {{ repo.description }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-5 text-right">
                          <span class="text-xl font-bold text-slate-800 dark:text-slate-200">{{ formatNumber(repo.count) }}</span>
                        </td>
                        <td class="px-6 py-5 text-right min-w-[200px]">
                          <div class="flex items-center justify-end gap-3">
                            <span class="text-sm font-medium text-slate-500 dark:text-slate-400 w-12">{{ calculateShare(repo.count, stats?.counts?.active) }}%</span>
                            <div class="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div class="h-full bg-primary" :style="{ width: `${calculateShare(repo.count, stats?.counts?.active)}%` }"></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
      </section>

      <!-- Footer CTA Section -->
      <section class="py-32 bg-white dark:bg-slate-900">
        <div class="container mx-auto max-w-screen-lg px-6">
            <div class="grid md:grid-cols-2 gap-20">
                <div>
                    <span class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8">03
                        Action</span>
                    <h2 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-12 text-slate-900 dark:text-white">
                        Explore<br>Servers.
                    </h2>
                    <NuxtLink to="/"
                        class="inline-flex items-center gap-2 text-lg font-light text-primary hover:text-primary/70 transition-colors">
                        サーバー一覧を見る
                        <span class="text-xs">→</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: stats, pending, error } = await useFetch('/api/v1/stats', {
  lazy: true
});

const formatNumber = (num?: number) => {
  return typeof num === 'number' ? new Intl.NumberFormat('ja-JP').format(num) : '-';
};

const calculateShare = (count: number, total?: number) => {
  if (!total || total === 0) return '0.0';
  return ((count / total) * 100).toFixed(1);
};

useHead({
  title: 'Network Statistics | Misskey Server List',
  meta: [
    { name: 'description', content: 'Statistics about Misskey instances and software usage distribution.' },
    { property: 'og:title', content: 'Network Statistics | Misskey Server List' },
    { property: 'og:description', content: 'Statistics about Misskey instances and software usage distribution.' },
  ]
});
</script>
