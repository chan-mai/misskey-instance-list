<template>
  <div class="min-h-screen w-full bg-neutral-50 text-neutral-800 dark:bg-black dark:text-neutral-100">
    <SiteHeader />
    <main>
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
