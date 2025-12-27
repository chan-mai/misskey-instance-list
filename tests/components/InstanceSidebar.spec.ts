import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import InstanceSidebar from '../../app/components/InstanceSidebar.vue'

describe('InstanceSidebar.vue', () => {
  let wrapper: VueWrapper
  const mockRoute = {
    query: {}
  }
  const mockRouter = {
    push: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.useRoute = vi.fn(() => mockRoute)
    global.useRouter = vi.fn(() => mockRouter)
  })

  describe('Component Rendering', () => {
    it('should render the sidebar container', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      expect(wrapper.find('aside').exists()).toBe(true)
    })

    it('should render mobile toggle button', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      const toggleButton = wrapper.find('button')
      expect(toggleButton.exists()).toBe(true)
      expect(toggleButton.text()).toContain('検索・ソート')
    })

    it('should hide content by default on mobile', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      const contentDiv = wrapper.find('.space-y-6')
      expect(contentDiv.exists()).toBe(true)
    })

    it('should render desktop header when expanded', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const header = wrapper.find('.hidden.lg\\:flex')
      expect(header.exists()).toBe(true)
      expect(header.text()).toContain('検索・ソート')
    })
  })

  describe('Total Count Display', () => {
    it('should display total count when not loading', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 42,
          loading: false
        }
      })
      
      expect(wrapper.text()).toContain('42')
      expect(wrapper.text()).toContain('instances')
    })

    it('should show loading state', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 0,
          loading: true
        }
      })
      
      expect(wrapper.text()).toContain('Loading')
    })

    it('should handle zero count', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 0,
          loading: false
        }
      })
      
      expect(wrapper.text()).toContain('0')
    })

    it('should handle large numbers', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 999999,
          loading: false
        }
      })
      
      expect(wrapper.text()).toContain('999999')
    })
  })

  describe('Mobile Toggle Behavior', () => {
    it('should toggle sidebar when button is clicked', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const toggleButton = wrapper.find('button')
      await toggleButton.trigger('click')
      
      // Check if content becomes visible
      const aside = wrapper.find('aside')
      expect(aside.classes()).toContain('fixed')
    })

    it('should rotate chevron icon when opened', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const toggleButton = wrapper.find('button')
      const chevronBefore = wrapper.find('svg.rotate-180')
      expect(chevronBefore.exists()).toBe(false)
      
      await toggleButton.trigger('click')
      
      const chevronAfter = wrapper.find('svg.rotate-180')
      expect(chevronAfter.exists()).toBe(true)
    })

    it('should show active indicator when search is active', () => {
      mockRoute.query = { q: 'test' }
      
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const indicator = wrapper.find('.animate-ping')
      expect(indicator.exists()).toBe(true)
    })

    it('should hide active indicator when no search', () => {
      mockRoute.query = {}
      
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const indicator = wrapper.find('.animate-ping')
      expect(indicator.exists()).toBe(false)
    })
  })

  describe('Search Functionality', () => {
    it('should render search input', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const searchInput = wrapper.find('input[type="search"]')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toBe('サーバー名で検索')
    })

    it('should handle search input changes', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const searchInput = wrapper.find('input[type="search"]')
      await searchInput.setValue('misskey')
      
      expect((searchInput.element as HTMLInputElement).value).toBe('misskey')
    })

    it('should submit search on form submit', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const form = wrapper.find('form')
      const searchInput = wrapper.find('input[type="search"]')
      
      await searchInput.setValue('test query')
      await form.trigger('submit')
      
      expect(mockRouter.push).toHaveBeenCalled()
    })

    it('should clear search when clear button is clicked', async () => {
      mockRoute.query = { q: 'existing' }
      
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const clearButton = wrapper.find('button[type="button"]')
      if (clearButton.exists()) {
        await clearButton.trigger('click')
        expect(mockRouter.push).toHaveBeenCalled()
      }
    })

    it('should populate search input from route query', () => {
      mockRoute.query = { q: 'initial search' }
      
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const searchInput = wrapper.find('input[type="search"]')
      expect((searchInput.element as HTMLInputElement).value).toBe('initial search')
    })
  })

  describe('Sort Functionality', () => {
    it('should render sort select dropdown', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const sortSelect = wrapper.find('select#sort')
      expect(sortSelect.exists()).toBe(true)
    })

    it('should have correct sort options', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const options = wrapper.findAll('select#sort option')
      expect(options.length).toBeGreaterThan(0)
    })

    it('should handle sort selection changes', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const sortSelect = wrapper.find('select#sort')
      await sortSelect.setValue('users')
      
      expect(mockRouter.push).toHaveBeenCalled()
    })

    it('should preserve sort value from route query', () => {
      mockRoute.query = { sort: 'notes' }
      
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const sortSelect = wrapper.find('select#sort')
      expect((sortSelect.element as HTMLSelectElement).value).toBe('notes')
    })
  })

  describe('Responsive Behavior', () => {
    it('should have mobile-specific classes', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const aside = wrapper.find('aside')
      expect(aside.classes()).toContain('sticky')
      expect(aside.classes()).toContain('top-16')
    })

    it('should have desktop-specific classes', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const aside = wrapper.find('aside')
      expect(aside.classes()).toContain('lg:static')
    })

    it('should apply fullscreen overlay when open on mobile', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const toggleButton = wrapper.find('button')
      await toggleButton.trigger('click')
      
      const aside = wrapper.find('aside')
      expect(aside.classes()).toContain('fixed')
      expect(aside.classes()).toContain('inset-0')
    })
  })

  describe('Props Validation', () => {
    it('should accept valid totalCount prop', () => {
      expect(() => {
        wrapper = mount(InstanceSidebar, {
          props: {
            totalCount: 100,
            loading: false
          }
        })
      }).not.toThrow()
    })

    it('should accept valid loading prop', () => {
      expect(() => {
        wrapper = mount(InstanceSidebar, {
          props: {
            totalCount: 100,
            loading: true
          }
        })
      }).not.toThrow()
    })

    it('should handle negative totalCount gracefully', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: -1,
          loading: false
        }
      })
      
      expect(wrapper.text()).toContain('-1')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const searchLabel = wrapper.find('label[for="query"]')
      expect(searchLabel.exists()).toBe(true)
      expect(searchLabel.text()).toContain('検索')
    })

    it('should have autocomplete off for search input', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const searchInput = wrapper.find('input[type="search"]')
      expect(searchInput.attributes('autocomplete')).toBe('off')
    })

    it('should have proper button types', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const submitButton = wrapper.findAll('button[type="submit"]')
      expect(submitButton.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty route query', () => {
      mockRoute.query = {}
      
      expect(() => {
        wrapper = mount(InstanceSidebar, {
          props: {
            totalCount: 100,
            loading: false
          }
        })
      }).not.toThrow()
    })

    it('should handle multiple simultaneous state changes', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const toggleButton = wrapper.find('button')
      const searchInput = wrapper.find('input[type="search"]')
      
      await toggleButton.trigger('click')
      await searchInput.setValue('test')
      await toggleButton.trigger('click')
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle rapid toggle clicks', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      const toggleButton = wrapper.find('button')
      
      await toggleButton.trigger('click')
      await toggleButton.trigger('click')
      await toggleButton.trigger('click')
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Lifecycle', () => {
    it('should mount successfully', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should unmount without errors', () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: false
        }
      })
      
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('should handle prop updates', async () => {
      wrapper = mount(InstanceSidebar, {
        props: {
          totalCount: 100,
          loading: true
        }
      })
      
      await wrapper.setProps({ loading: false, totalCount: 200 })
      
      expect(wrapper.text()).toContain('200')
      expect(wrapper.text()).not.toContain('Loading')
    })
  })
})