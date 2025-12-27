<template>
  <section class="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-neutral-100 dark:bg-black">
      <!-- Gradient accent -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/30 to-transparent"></div>
      </div>
      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto max-w-screen-xl px-6 py-24">
      <div class="max-w-3xl">
        <!-- Breadcrumb / Label -->
        <p v-if="label" class="text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-white/50 mb-6">
          {{ label }}
        </p>
        
        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-8 leading-tight tracking-tight">
          <slot name="title">{{ title }}</slot>
        </h1>
        
        <!-- Description -->
        <p v-if="description" class="text-lg text-neutral-600 dark:text-white/60 leading-relaxed max-w-2xl">
          {{ description }}
        </p>

        <!-- Optional slot for extra content -->
        <slot name="extra"></slot>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div v-if="showScroll" class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400 dark:text-white/30">
      <span class="text-xs tracking-widest uppercase">Scroll</span>
      <div class="w-px h-8 bg-gradient-to-b from-neutral-400 dark:from-white/30 to-transparent animate-bounce"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  label?: string;
  description?: string;
  showScroll?: boolean;
}>();
</script>
