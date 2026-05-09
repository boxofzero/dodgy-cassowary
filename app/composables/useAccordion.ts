import { useAccordionStore } from '@/stores/accordionStore'
import { useSortable } from '@vueuse/integrations/useSortable'
import type { Ref } from 'vue'

export interface AccordionStoreData {
  index_position: number
  open: boolean
}

export function useAccordion<T extends { slot: string }>(
  templateRef: string,
  accordionGroupKey: string,
  accordionItems: Ref<T[]>,
  accordionActives: Ref<string[]>
) {
  const templateEl = useTemplateRef<HTMLElement>(templateRef)
  
  useSortable(templateEl, accordionItems, {
    animation: 150,
  })

  onBeforeMount(() => {
    useAccordionStore().init()
    const accordionGroupData = useAccordionStore().getGroup(
      accordionGroupKey
    ) as Record<string, AccordionStoreData> | undefined
    
    if (accordionGroupData === undefined) {
      return
    }

    const reorderedAccordionItems: T[] = []
    accordionActives.value = []
    
    Object.entries(accordionGroupData).forEach(([key, value]) => {
      const foundItem = accordionItems.value.find((item) => item.slot === key)
      if (foundItem) {
        reorderedAccordionItems[value.index_position] = foundItem
      }

      if (value.open) {
        accordionActives.value.push(key)
      }
    })

    accordionItems.value.forEach((item) => {
      if (
        !accordionGroupData[item.slot] &&
        !accordionActives.value.includes(item.slot)
      ) {
        reorderedAccordionItems.push(item)
      }
    })

    // Filter out both null and undefined (e.g. empty slots in sparse arrays)
    accordionItems.value = reorderedAccordionItems.filter(
      (value) => value != null
    )
  })

  watch(
    [accordionItems, accordionActives] as const,
    ([newAccordionItems, newAccordionActives]) => {
      const accordionStoreData: Record<string, AccordionStoreData> = {}
      
      newAccordionItems.forEach((item, index) => {
        accordionStoreData[item.slot] = {
          index_position: index,
          open: newAccordionActives.includes(item.slot),
        }
      })
      
      useAccordionStore().upsertWholeGroup(
        accordionGroupKey,
        accordionStoreData
      )
    },
    { deep: true }
  )

  return {
    accordionItems,
    accordionActives,
  }
}