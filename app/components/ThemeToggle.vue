<template>
  <div ref="rootEl" class="relative inline-flex items-center">
    <!-- Button -->
    <button type="button" class="group h-9 w-9 inline-flex items-center justify-center rounded-lg border-0 transition-all duration-300
        bg-slate-100 text-slate-600
        hover:bg-primary hover:text-white
        focus:outline-none
        dark:bg-slate-800 dark:text-slate-300
        dark:hover:bg-primary dark:hover:text-white" :aria-label="`テーマ: ${currentLabel}`" :aria-expanded="isOpen"
      @click.stop="toggle">
      <component :is="currentIcon" class="h-5 w-5 transition-colors duration-300" />
    </button>

    <!-- Dropdown -->
    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="isOpen" class="absolute right-0 top-11 z-50 w-44 origin-top-right overflow-hidden rounded-xl border-0 shadow-xl
          bg-white shadow-slate-300/50
          dark:bg-slate-800 dark:shadow-black/40">
        <div class="p-1">
          <button v-for="option in options" :key="option.value" type="button" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium border-0 rounded-lg transition-all duration-150
              focus:outline-none"
            :class="current === option.value
              ? 'bg-primary text-white cursor-default'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer'"
            @click="select(option.value)">
            <component :is="option.icon" class="h-4 w-4 shrink-0" />
            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import type { FunctionalComponent } from 'vue';

type ThemeMode = 'light' | 'system' | 'dark';

// Iconたち
const SunIcon: FunctionalComponent = () =>
  h('svg', { class: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.5V3m0 18v-1.5M5.636 5.636 4.5 4.5m14.864 0-1.136 1.136M4.5 12H3m18 0h-1.5M5.636 18.364 4.5 19.5m14.864 0-1.136-1.136M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z' }),
  ]);

const MoonIcon: FunctionalComponent = () =>
  h('svg', { class: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z' }),
  ]);

const LaptopIcon: FunctionalComponent = () =>
  h('svg', { class: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 4.5A1.5 1.5 0 014.5 3h15A1.5 1.5 0 0121 4.5v9A1.5 1.5 0 0119.5 15h-15A1.5 1.5 0 013 13.5v-9z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M2.5 19h19' }),
  ]);

// optionたち
const options = [
  { value: 'light' as ThemeMode, label: 'Light', icon: SunIcon },
  { value: 'dark' as ThemeMode, label: 'Dark', icon: MoonIcon },
  { value: 'system' as ThemeMode, label: 'System', icon: LaptopIcon }

] as const;

// colormodeを取得
const colorMode = useColorMode();

// State系
const rootEl = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const systemPrefersDark = ref(false);
const current = ref<ThemeMode>((colorMode.preference as ThemeMode) || 'system');

// Computed系
const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (current.value !== 'system') return current.value;
  if (colorMode.value === 'dark' || colorMode.value === 'light') return colorMode.value;
  return systemPrefersDark.value ? 'dark' : 'light';
});

const currentIcon = computed(() => {
  switch (current.value) {
    case 'light': return MoonIcon;
    case 'dark': return SunIcon;
    case 'system': return LaptopIcon;
    default: return LaptopIcon;
  }
});

const currentLabel = computed(() => {
  if (current.value === 'system') {
    return `System (${resolvedTheme.value === 'dark' ? 'Dark' : 'Light'})`;
  }
  return options.find((o) => o.value === current.value)?.label ?? 'System';
});

// Methods
const toggle = () => { isOpen.value = !isOpen.value; };

const select = (mode: ThemeMode) => {
  colorMode.preference = mode;
  current.value = mode;
  isOpen.value = false;
};

const handleClickOutside = (ev: MouseEvent) => {
  if (isOpen.value && rootEl.value && !rootEl.value.contains(ev.target as Node)) {
    isOpen.value = false;
  }
};

// Media queryもつかう
let mediaQuery: MediaQueryList | null = null;
const onMediaChange = (e: MediaQueryListEvent | MediaQueryList) => { systemPrefersDark.value = e.matches; };

// Lifecycle
onMounted(() => {
  if (!colorMode.preference) colorMode.preference = 'system';
  current.value = (colorMode.preference as ThemeMode) || 'system';

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  onMediaChange(mediaQuery);
  mediaQuery.addEventListener('change', onMediaChange);

  document.addEventListener('click', handleClickOutside);

});
watch(() => colorMode.preference, (pref) => { current.value = (pref as ThemeMode) || 'system'; });
watchEffect(() => {
  if (import.meta.client) {
    const theme = resolvedTheme.value;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
  }
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', onMediaChange);
  document.removeEventListener('click', handleClickOutside);
});
</script>
