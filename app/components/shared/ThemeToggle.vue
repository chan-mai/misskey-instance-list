<template>
  <div ref="rootEl" class="relative inline-flex items-center">
      <button type="button" class="group h-9 w-9 border-none inline-flex items-center justify-center transition-colors duration-200
        bg-neutral-100 text-neutral-600
        hover:bg-neutral-200 hover:text-neutral-900
        dark:bg-neutral-800 dark:text-neutral-400
        dark:hover:bg-neutral-700 dark:hover:text-white
        focus:outline-none" :aria-label="`Theme: ${currentLabel}`" :aria-expanded="isOpen" @click.stop="toggle">

      <ClientOnly>
        <Icon v-if="preference === 'light'" name="lucide:sun" class="h-4 w-4" />
        <Icon v-else-if="preference === 'dark'" name="lucide:moon" class="h-4 w-4" />
        <Icon v-else name="lucide:monitor" class="h-4 w-4" />
        <template #fallback>
          <div class="h-4 w-4" />
        </template>
      </ClientOnly>
    </button>

    <!-- Dropdown -->
    <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isOpen" class="absolute right-0 top-11 z-50 w-40 origin-top-right shadow-lg
          bg-white
          dark:bg-neutral-900">
        <div class="p-1">
          <button v-for="option in options" :key="option.value" type="button" class="flex w-full items-center gap-2 px-3 py-2 text-sm tracking-wide border-0 transition-colors duration-150
              focus:outline-none"
            :class="preference === option.value
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 cursor-default'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white cursor-pointer'"
            @click="select(option.value)">

            <Icon v-if="option.value === 'light'" name="lucide:sun" class="h-4 w-4 shrink-0" />
            <Icon v-else-if="option.value === 'dark'" name="lucide:moon" class="h-4 w-4 shrink-0" />
            <Icon v-else name="lucide:monitor" class="h-4 w-4 shrink-0" />

            <span>{{ option.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type ThemeMode = 'light' | 'system' | 'dark';

const options = [
  { value: 'light' as ThemeMode, label: 'Light' },
  { value: 'dark' as ThemeMode, label: 'Dark' },
  { value: 'system' as ThemeMode, label: 'System' }
] as const;

const colorMode = useColorMode();

const preference = computed({
  get: () => colorMode.preference,
  set: (val: ThemeMode) => { colorMode.preference = val; }
});

const rootEl = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const systemPrefersDark = ref(false);

// Computed系
const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (preference.value === 'system') {
    return systemPrefersDark.value ? 'dark' : 'light';
  }
  return preference.value === 'dark' ? 'dark' : 'light';
});

const currentLabel = computed(() => {
  if (preference.value === 'system') {
    return `System (${resolvedTheme.value === 'dark' ? 'Dark' : 'Light'})`;
  }
  return options.find((o) => o.value === preference.value)?.label ?? 'System';
});

// Methods
const toggle = () => { isOpen.value = !isOpen.value; };

const select = (mode: ThemeMode) => {
  preference.value = mode;
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
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  onMediaChange(mediaQuery);
  mediaQuery.addEventListener('change', onMediaChange);

  document.addEventListener('click', handleClickOutside);

});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', onMediaChange);
  document.removeEventListener('click', handleClickOutside);
});
</script>
