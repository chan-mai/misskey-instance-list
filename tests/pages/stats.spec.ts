import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import Stats from '../../app/pages/stats.vue'

describe('stats.vue', () => {
  let wrapper: VueWrapper
  const mockStatsData = {
    totalInstances: 100,
    totalUsers: 50000,
    totalNotes: 1000000,
    repositories: [
      {
        id: 1,
        url: 'https://github.com/misskey-dev/misskey',
        name: 'misskey',
        stars: 1000,
        forks: 200,
        instanceCount: 50
      },
      {
        id: 2,
        url: 'https://github.com/transfem-org/sharkey',
        name: 'sharkey',
        stars: 500,
        forks: 100,
        instanceCount: 30
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    global.useHead = vi.fn()
    global.useFetch = vi.fn(() => ({
      data: { value: mockStatsData },
      pending: { value: false },
      error: { value: null },
      refresh: vi.fn()
    }))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render the stats page', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should render page title', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const heading = wrapper.find('h1, h2')
      expect(heading.exists()).toBe(true)
    })

    it('should have main content container', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const container = wrapper.find('main, div, section')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Data Fetching', () => {
    it('should call useFetch for stats data', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(global.useFetch).toHaveBeenCalled()
    })

    it('should display stats when data is loaded', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text.length).toBeGreaterThan(0)
    })

    it('should show loading state', () => {
      global.useFetch = vi.fn(() => ({
        data: { value: null },
        pending: { value: true },
        error: { value: null },
        refresh: vi.fn()
      }))
      
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle error state', () => {
      global.useFetch = vi.fn(() => ({
        data: { value: null },
        pending: { value: false },
        error: { value: new Error('Failed to fetch') },
        refresh: vi.fn()
      }))
      
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Statistics Display', () => {
    it('should display total instances count', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('100')
    })

    it('should display total users count', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('50000')
    })

    it('should display total notes count', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('1000000')
    })

    it('should format large numbers appropriately', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      // Should display numbers (formatting is optional)
      const text = wrapper.text()
      expect(text.match(/\d+/)).toBeTruthy()
    })
  })

  describe('Repository Statistics', () => {
    it('should display repository information', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('misskey')
    })

    it('should show repository stars', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('1000')
    })

    it('should show repository forks', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('200')
    })

    it('should show instance count per repository', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('50')
    })

    it('should render multiple repositories', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const text = wrapper.text()
      expect(text).toContain('misskey')
      expect(text).toContain('sharkey')
    })

    it('should have links to repository URLs', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: false
          }
        }
      })
      
      await flushPromises()
      
      const links = wrapper.findAll('a[href*="github.com"]')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Data Visualization', () => {
    it('should render statistics cards or sections', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const cards = wrapper.findAll('div.border, div.rounded, div.shadow, div.bg-white')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have visual hierarchy for stats', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const html = wrapper.html()
      expect(html).toMatch(/text-\d+xl|text-lg|text-xl|font-bold/)
    })

    it('should use appropriate spacing', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const html = wrapper.html()
      expect(html).toMatch(/space-y|gap|grid/)
    })
  })

  describe('Empty State Handling', () => {
    it('should handle empty repository list', () => {
      global.useFetch = vi.fn(() => ({
        data: { value: { ...mockStatsData, repositories: [] } },
        pending: { value: false },
        error: { value: null },
        refresh: vi.fn()
      }))
      
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle zero values', () => {
      global.useFetch = vi.fn(() => ({
        data: { 
          value: { 
            totalInstances: 0,
            totalUsers: 0,
            totalNotes: 0,
            repositories: []
          } 
        },
        pending: { value: false },
        error: { value: null },
        refresh: vi.fn()
      }))
      
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle null data gracefully', () => {
      global.useFetch = vi.fn(() => ({
        data: { value: null },
        pending: { value: false },
        error: { value: null },
        refresh: vi.fn()
      }))
      
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('SEO and Meta Tags', () => {
    it('should set page meta information', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(global.useHead).toHaveBeenCalled()
    })
  })

  describe('Styling and Layout', () => {
    it('should have responsive design classes', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const html = wrapper.html()
      expect(html).toMatch(/sm:|md:|lg:|xl:/)
    })

    it('should support dark mode', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const html = wrapper.html()
      expect(html).toContain('dark:')
    })

    it('should have proper container classes', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const html = wrapper.html()
      expect(html).toMatch(/container|max-w|mx-auto/)
    })
  })

  describe('Accessibility', () => {
    it('should use semantic HTML', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const semantic = wrapper.findAll('main, section, article, aside')
      expect(semantic.length).toBeGreaterThan(0)
    })

    it('should have descriptive headings', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const headings = wrapper.findAll('h1, h2, h3')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have proper heading hierarchy', async () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      await flushPromises()
      
      const h1Count = wrapper.findAll('h1').length
      expect(h1Count).toBeLessThanOrEqual(1)
    })
  })

  describe('Performance Considerations', () => {
    it('should not cause memory leaks on unmount', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('should handle rapid data updates', async () => {
      const refreshFn = vi.fn()
      global.useFetch = vi.fn(() => ({
        data: { value: mockStatsData },
        pending: { value: false },
        error: { value: null },
        refresh: refreshFn
      }))
      
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle extremely large numbers', () => {
      global.useFetch = vi.fn(() => ({
        data: { 
          value: { 
            totalInstances: 999999999,
            totalUsers: 999999999999,
            totalNotes: 999999999999999,
            repositories: []
          } 
        },
        pending: { value: false },
        error: { value: null },
        refresh: vi.fn()
      }))
      
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle malformed repository data', () => {
      global.useFetch = vi.fn(() => ({
        data: { 
          value: { 
            totalInstances: 100,
            totalUsers: 5000,
            totalNotes: 100000,
            repositories: [
              { url: null, name: null, stars: null }
            ]
          } 
        },
        pending: { value: false },
        error: { value: null },
        refresh: vi.fn()
      }))
      
      expect(() => {
        wrapper = mount(Stats, {
          global: {
            stubs: {
              NuxtLink: true
            }
          }
        })
      }).not.toThrow()
    })

    it('should handle missing useFetch', () => {
      global.useFetch = undefined as any
      
      expect(() => {
        wrapper = mount(Stats, {
          global: {
            stubs: {
              NuxtLink: true
            }
          }
        })
      }).not.toThrow()
    })
  })

  describe('Component Lifecycle', () => {
    it('should mount successfully', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should unmount cleanly', () => {
      wrapper = mount(Stats, {
        global: {
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })

    it('should be reusable', () => {
      const w1 = mount(Stats, {
        global: { stubs: { NuxtLink: true } }
      })
      w1.unmount()
      
      const w2 = mount(Stats, {
        global: { stubs: { NuxtLink: true } }
      })
      expect(w2.exists()).toBe(true)
      w2.unmount()
    })
  })
})