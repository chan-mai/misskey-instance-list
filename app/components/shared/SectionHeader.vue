<script setup lang="ts">
interface Props {
    number: string;
    title: string;
    accentColor?: string;
}

withDefaults(defineProps<Props>(), {
    accentColor: 'bg-primary'
});
</script>

<template>
    <div class="mb-12 lg:mb-16">
        <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">{{ number }}</p>
        <h2 class="text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">{{ title }}</h2>
        <div class="w-12 h-px" :class="accentColor"></div>
    </div>
</template>
