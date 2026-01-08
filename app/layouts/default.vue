<template>
  <div class="min-h-screen w-full bg-neutral-50 text-neutral-800 dark:bg-black dark:text-neutral-100">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: `https://servers.misskey.ink${route.path}`
    }
  ]
}));

</script>
