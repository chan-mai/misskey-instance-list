import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import SiteHeader from '../../app/components/SiteHeader.vue'
import ThemeToggle from '../../app/components/ThemeToggle.vue'

// Mock color mode
const mockColorMode = {
  preference: 'system',
  value: 'light'
}

global.useColorMode = () => mockColorMode

describe('SiteHeader.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the header element', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      expect(wrapper.find('header').exists()).toBe(true)
    })

    it('should render the site logo/title', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      expect(wrapper.text()).toContain('Misskey')
    })

    it('should include ThemeToggle component', () => {
      wrapper = mount(SiteHeader, {
        global: {
          components: {
            ThemeToggle
          },
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const themeToggle = wrapper.findComponent(ThemeToggle)
      expect(themeToggle.exists()).toBe(true)
    })
  })

  describe('Navigation Links', () => {
    it('should render home link', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const links = wrapper.findAll('[to]')
      const homeLink = links.find(link => link.attributes('to') === '/')
      expect(homeLink).toBeDefined()
    })

    it('should render navigation menu items', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(true)
    })

    it('should have proper link structure', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const links = wrapper.findAll('[to]')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Styling and Layout', () => {
    it('should have sticky positioning', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const header = wrapper.find('header')
      expect(header.classes()).toContain('sticky')
    })

    it('should have proper z-index for overlay', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const header = wrapper.find('header')
      expect(header.classes()).toContain('z-50')
    })

    it('should have backdrop blur effect', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const header = wrapper.find('header')
      expect(header.classes()).toContain('backdrop-blur-xl')
    })

    it('should have dark mode styles', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const header = wrapper.find('header')
      const classes = header.classes().join(' ')
      expect(classes).toContain('dark:')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive padding', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const container = wrapper.find('.container, .max-w-7xl, .px-4, .px-6')
      expect(container.exists()).toBe(true)
    })

    it('should have mobile and desktop layouts', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const header = wrapper.find('header')
      const classes = header.classes().join(' ')
      expect(classes).toMatch(/md:|lg:|sm:/)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic header element', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      expect(wrapper.find('header').exists()).toBe(true)
    })

    it('should have navigation landmark', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(true)
    })

    it('should have keyboard-navigable elements', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const interactiveElements = wrapper.findAll('a, button')
      expect(interactiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('Brand/Logo Display', () => {
    it('should display site title', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const text = wrapper.text()
      expect(text).toMatch(/Misskey|Instance|List/)
    })

    it('should have clickable logo linking to home', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const links = wrapper.findAll('[to]')
      const homeLink = links.find(link => link.attributes('to') === '/')
      expect(homeLink).toBeDefined()
    })
  })

  describe('Component Integration', () => {
    it('should properly integrate ThemeToggle', () => {
      wrapper = mount(SiteHeader, {
        global: {
          components: {
            ThemeToggle
          },
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const themeToggle = wrapper.findComponent(ThemeToggle)
      expect(themeToggle.exists()).toBe(true)
    })

    it('should position ThemeToggle correctly in header', () => {
      wrapper = mount(SiteHeader, {
        global: {
          components: {
            ThemeToggle
          },
          stubs: {
            NuxtLink: true
          }
        }
      })
      
      const header = wrapper.find('header')
      const themeToggle = wrapper.findComponent(ThemeToggle)
      
      expect(header.element.contains(themeToggle.element)).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should render without ThemeToggle if not available', () => {
      expect(() => {
        wrapper = mount(SiteHeader, {
          global: {
            stubs: {
              NuxtLink: true,
              ThemeToggle: true
            }
          }
        })
      }).not.toThrow()
    })

    it('should handle missing navigation items gracefully', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Lifecycle', () => {
    it('should mount successfully', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should unmount without errors', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })
  })

  describe('Visual Consistency', () => {
    it('should have consistent spacing', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const header = wrapper.find('header')
      const classes = header.classes().join(' ')
      expect(classes).toMatch(/p-|py-|px-|gap-/)
    })

    it('should have transition effects', () => {
      wrapper = mount(SiteHeader, {
        global: {
          stubs: {
            NuxtLink: true,
            ThemeToggle: true
          }
        }
      })
      
      const header = wrapper.find('header')
      const classes = header.classes().join(' ')
      expect(classes).toMatch(/transition/)
    })
  })
})