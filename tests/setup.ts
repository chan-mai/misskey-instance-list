import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Nuxt auto-imports
global.defineProps = vi.fn()
global.defineEmits = vi.fn()
global.defineExpose = vi.fn()
global.withDefaults = vi.fn()

// Mock useNuxtApp
global.useNuxtApp = vi.fn(() => ({
  $config: {
    public: {}
  }
}))

// Mock useState
global.useState = vi.fn((key: string, init?: () => any) => {
  const state = init ? init() : undefined
  return { value: state }
})

// Mock useRoute
global.useRoute = vi.fn(() => ({
  params: {},
  query: {},
  path: '/',
  fullPath: '/',
  name: undefined,
  meta: {}
}))

// Mock useRouter
global.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
}))

// Mock useFetch
global.useFetch = vi.fn()

// Mock useAsyncData
global.useAsyncData = vi.fn()

// Configure Vue Test Utils
config.global.mocks = {
  $config: {
    public: {}
  }
}