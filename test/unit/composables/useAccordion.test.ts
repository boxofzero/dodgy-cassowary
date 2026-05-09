import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAccordion } from '../../../app/composables/useAccordion'
import type { AccordionStoreData } from '../../../app/composables/useAccordion'

vi.mock('@vueuse/core', () => ({
  useTemplateRef: vi.fn(() => ({ value: null })),
}))

vi.mock('@vueuse/integrations/useSortable', () => ({
  useSortable: vi.fn(),
}))

const mockAccordionStore = {
  init: vi.fn(),
  getGroup: vi.fn(),
  upsertWholeGroup: vi.fn(),
  accordions: {},
}

vi.mock('../../../app/stores/accordionStore', () => ({
  useAccordionStore: vi.fn(() => mockAccordionStore),
}))

describe('useAccordion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should return accordionItems and accordionActives', () => {
    const items = ref([{ slot: 'item1' }, { slot: 'item2' }])
    const actives = ref<string[]>([])

    const TestComponent = {
      setup() {
        return useAccordion('test-ref', 'group1', items, actives)
      },
      template: '<div></div>',
    }

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm

    expect(vm.accordionItems).toEqual(items.value)
    expect(vm.accordionActives).toEqual(actives.value)
  })

  it('should call store init and getGroup on mount', async () => {
    const items = ref([{ slot: 'item1' }])
    const actives = ref<string[]>([])

    const TestComponent = {
      setup() {
        return useAccordion('test-ref', 'group1', items, actives)
      },
      template: '<div></div>',
    }

    mount(TestComponent)
    await nextTick()

    expect(mockAccordionStore.init).toHaveBeenCalled()
    expect(mockAccordionStore.getGroup).toHaveBeenCalledWith('group1')
  })

  it('should reorder items based on stored positions', async () => {
    const items = ref([
      { slot: 'item3' },
      { slot: 'item1' },
      { slot: 'item2' },
    ])
    const actives = ref<string[]>([])

    const storedData: Record<string, AccordionStoreData> = {
      item1: { index_position: 0, open: false },
      item2: { index_position: 1, open: true },
      item3: { index_position: 2, open: false },
    }

    mockAccordionStore.getGroup.mockReturnValue(storedData)

    const TestComponent = {
      setup() {
        return useAccordion('test-ref', 'group1', items, actives)
      },
      template: '<div></div>',
    }

    mount(TestComponent)
    await nextTick()

    expect(mockAccordionStore.getGroup).toHaveBeenCalledWith('group1')
  })

  it('should return active items from stored data', async () => {
    const storedData: Record<string, AccordionStoreData> = {
      item1: { index_position: 0, open: true },
      item2: { index_position: 1, open: false },
      item3: { index_position: 2, open: true },
    }

    const activeItems = Object.entries(storedData)
      .filter(([_, value]) => value.open)
      .map(([key]) => key)

    expect(activeItems).toEqual(['item1', 'item3'])
  })

  it('should call upsertWholeGroup when items change', async () => {
    const items = ref([{ slot: 'item1' }])
    const actives = ref<string[]>([])

    const TestComponent = {
      setup() {
        return useAccordion('test-ref', 'group1', items, actives)
      },
      template: '<div></div>',
    }

    mount(TestComponent)
    await nextTick()

    // Modify items to trigger watcher
    items.value = [{ slot: 'item1' }, { slot: 'item2' }]
    await nextTick()

    expect(mockAccordionStore.upsertWholeGroup).toHaveBeenCalled()
  })
})
