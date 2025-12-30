<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })

const is404 = computed(() => props.error.statusCode === 404)
const title = computed(() => is404.value ? 'Page Not Found' : 'An Error Occurred')
const description = computed(() => is404.value ? 'The page you are looking for does not exist.' : 'Something went wrong.')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-back dark:bg-back-dark text-slate-800 dark:text-slate-200 transition-colors duration-300">
    <!-- Background Elements -->
    <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-pulse mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
    <div class="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse delay-1000 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

    <div class="relative z-10 max-w-lg w-full px-6 text-center">
      <div class="backdrop-blur-md bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-12 shadow-2xl ring-1 ring-black/5">
        <div class="mb-6 flex justify-center">
            <Icon 
              :name="is404 ? 'lucide:file-question' : 'lucide:alert-triangle'" 
              class="w-24 h-24 text-primary animate-bounce-slow"
              mode="svg"
            />
        </div>
        
        <h1 class="text-6xl font-bold mb-4 font-mono text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          {{ error.statusCode }}
        </h1>
        
        <h2 class="text-2xl font-bold mb-4 dark:text-white text-slate-900">
          {{ title }}
        </h2>
        
        <p class="text-slate-600 dark:text-gray-300 mb-8 leading-relaxed">
          {{ description }}
          <br v-if="error.message && !is404">
          <span v-if="error.message && !is404" class="text-xs opacity-75 font-mono mt-4 block bg-black/5 dark:bg-black/20 p-3 rounded-lg text-left break-all">
            {{ error.message }}
          </span>
        </p>
        
        <button
          @click="handleError"
          class="cursor-pointer group relative inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent rounded-full font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
        >
          <Icon name="lucide:home" class="w-5 h-5 transition-transform group-hover:-translate-y-1" mode="svg" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
