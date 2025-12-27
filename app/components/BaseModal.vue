<template>
  <dialog 
    ref="dialogRef" 
    class="backdrop:bg-black/80 backdrop:backdrop-blur-sm p-0 bg-back dark:bg-back-dark shadow-2xl overflow-hidden w-full max-w-2xl text-left transition-all border border-neutral-200 dark:border-neutral-800"
    @click="onBackdropClick"
    @cancel="close"
  >
    <div class="flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
        <h3 class="text-lg font-bold text-neutral-900 dark:text-white">
          <slot name="title">Modal Title</slot>
        </h3>
        <button
          @click="close"
          class="p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <slot></slot>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

watch(() => props.modelValue, (val) => {
  if (val) {
    dialogRef.value?.showModal();
  } else {
    dialogRef.value?.close();
  }
});

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    close();
  }
}

onMounted(() => {
  if (props.modelValue) {
    dialogRef.value?.showModal();
  }
});
</script>

<style scoped>
dialog {
  max-width: 42rem; /* max-w-2xl */
}

dialog::backdrop {
  animation: fade-in 0.2s ease-out;
}

dialog[open] {
  animation: zoom-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
