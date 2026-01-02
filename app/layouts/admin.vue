<template>
  <div class="min-h-screen bg-back text-sm flex flex-col">
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-back-dark sticky top-0 z-50">
      <div class="container mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="font-bold text-lg">
            (Unofficial) Misskey Server List <span class="text-xs font-normal text-gray-500">Admin Console</span>
          </NuxtLink>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="hover:text-primary transition-colors">
            <Icon name="lucide:home" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </div>
    </header>

    <div class="flex-1 container mx-auto flex items-start">
      <!-- Sidebar -->
      <aside class="w-64 py-8 pr-8 hidden md:block shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <nav class="space-y-1">
          <NuxtLink
            to="/admin"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            active-class="bg-primary/10 text-primary font-medium"
          >
            <Icon name="lucide:layout-dashboard" class="w-5 h-5" />
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/admin/excluded-hosts"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            active-class="!bg-primary/10 !text-primary font-medium"
          >
            <Icon name="lucide:shield-ban" class="w-5 h-5" />
            Excluded Hosts
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 py-8 w-full min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>
