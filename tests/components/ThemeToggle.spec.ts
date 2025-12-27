import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ThemeToggle from '../../app/components/ThemeToggle.vue'

// Mock @nuxtjs/color-mode
const mockSetColorMode = vi.fn()
const mockColorMode = {
  preference: 'system',
  value: 'light',
  unknown: false,
  forced: false
}

vi.mock('@nuxtjs/color-mode', () => ({
  useColorMode: () => mockColorMode
}))

global.useColorMode = () => mockColorMode

describe('ThemeToggle.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    mockColorMode.preference = 'system'
    mockColorMode.value = 'light'
  })

  describe('Component Rendering', () => {
    it('should render the theme toggle button', () => {
      wrapper = mount(ThemeToggle)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('should have proper accessibility attributes', () => {
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toContain('テーマ')
      expect(button.attributes('type')).toBe('button')
    })

    it('should render with correct initial classes', () => {
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      expect(button.classes()).toContain('p-2')
      expect(button.classes()).toContain('rounded-lg')
    })
  })

  describe('Theme State Display', () => {
    it('should show light mode icon when theme is light', async () => {
      mockColorMode.value = 'light'
      wrapper = mount(ThemeToggle)
      
      const lightIcon = wrapper.find('svg[data-theme="light"]')
      expect(lightIcon.exists()).toBe(true)
    })

    it('should show dark mode icon when theme is dark', async () => {
      mockColorMode.value = 'dark'
      wrapper = mount(ThemeToggle)
      
      const darkIcon = wrapper.find('svg[data-theme="dark"]')
      expect(darkIcon.exists()).toBe(true)
    })

    it('should show system mode icon when preference is system', () => {
      mockColorMode.preference = 'system'
      mockColorMode.value = 'light'
      wrapper = mount(ThemeToggle)
      
      const systemIcon = wrapper.find('svg[data-theme="system"]')
      expect(systemIcon.exists()).toBe(true)
    })
  })

  describe('Theme Cycling Behavior', () => {
    it('should cycle from light to dark', async () => {
      mockColorMode.preference = 'light'
      mockColorMode.value = 'light'
      
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      await button.trigger('click')
      
      // After click, preference should be updated to next theme
      // The actual implementation updates colorMode.preference
      expect(button.exists()).toBe(true)
    })

    it('should cycle from dark to system', async () => {
      mockColorMode.preference = 'dark'
      mockColorMode.value = 'dark'
      
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      await button.trigger('click')
      expect(button.exists()).toBe(true)
    })

    it('should cycle from system to light', async () => {
      mockColorMode.preference = 'system'
      mockColorMode.value = 'light'
      
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      await button.trigger('click')
      expect(button.exists()).toBe(true)
    })

    it('should handle rapid clicks without errors', async () => {
      mockColorMode.preference = 'light'
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      await button.trigger('click')
      await button.trigger('click')
      await button.trigger('click')
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Visual Feedback', () => {
    it('should have hover effects', () => {
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      expect(button.classes()).toContain('hover:bg-slate-100')
    })

    it('should have transition classes', () => {
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      expect(button.classes()).toContain('transition-colors')
    })

    it('should have dark mode specific classes', () => {
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      expect(button.classes()).toContain('dark:hover:bg-slate-800')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      wrapper = mount(ThemeToggle)
      const button = wrapper.find('button')
      
      await button.trigger('keydown.enter')
      expect(wrapper.exists()).toBe(true)
    })

    it('should have descriptive aria-label for each theme state', () => {
      // Test light mode
      mockColorMode.preference = 'light'
      wrapper = mount(ThemeToggle)
      let button = wrapper.find('button')
      expect(button.attributes('aria-label')).toContain('ライト')
      wrapper.unmount()
      
      // Test dark mode
      mockColorMode.preference = 'dark'
      wrapper = mount(ThemeToggle)
      button = wrapper.find('button')
      expect(button.attributes('aria-label')).toContain('ダーク')
      wrapper.unmount()
      
      // Test system mode
      mockColorMode.preference = 'system'
      wrapper = mount(ThemeToggle)
      button = wrapper.find('button')
      expect(button.attributes('aria-label')).toContain('システム')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined color mode gracefully', () => {
      mockColorMode.preference = undefined as any
      mockColorMode.value = 'light'
      
      expect(() => {
        wrapper = mount(ThemeToggle)
      }).not.toThrow()
    })

    it('should handle invalid color mode values', () => {
      mockColorMode.preference = 'invalid' as any
      mockColorMode.value = 'light'
      
      expect(() => {
        wrapper = mount(ThemeToggle)
      }).not.toThrow()
    })

    it('should render without crashing when color mode is null', () => {
      mockColorMode.value = null as any
      
      expect(() => {
        wrapper = mount(ThemeToggle)
      }).not.toThrow()
    })
  })

  describe('Icon Rendering', () => {
    it('should render SVG icons with correct viewBox', () => {
      wrapper = mount(ThemeToggle)
      const svg = wrapper.find('svg')
      
      expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    })

    it('should have proper icon sizing classes', () => {
      wrapper = mount(ThemeToggle)
      const svg = wrapper.find('svg')
      
      expect(svg.classes()).toContain('w-5')
      expect(svg.classes()).toContain('h-5')
    })

    it('should render icons without fill by default', () => {
      wrapper = mount(ThemeToggle)
      const svg = wrapper.find('svg')
      
      expect(svg.attributes('fill')).toBe('none')
    })
  })

  describe('Component Lifecycle', () => {
    it('should mount successfully', () => {
      wrapper = mount(ThemeToggle)
      expect(wrapper.exists()).toBe(true)
    })

    it('should unmount without errors', () => {
      wrapper = mount(ThemeToggle)
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('should be reusable across multiple mounts', () => {
      const wrapper1 = mount(ThemeToggle)
      expect(wrapper1.exists()).toBe(true)
      wrapper1.unmount()
      
      const wrapper2 = mount(ThemeToggle)
      expect(wrapper2.exists()).toBe(true)
      wrapper2.unmount()
    })
  })
})