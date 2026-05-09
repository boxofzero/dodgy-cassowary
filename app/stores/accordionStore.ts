import { useStorage } from '@vueuse/core'

const accordionsRepo = () => {
  return useStorage('accordions', {})
}

export const useAccordionStore = defineStore('accordions', () => {
  const accordions = ref({}) as any

  function init() {
    accordions.value = accordionsRepo().value
  }

  function storeToStorage() {
    accordionsRepo().value = accordions.value
  }

  function getGroup(group_key: string): any {
    return accordions.value[group_key]
  }

  function getIndex(group_key: string, index_key: string): any {
    if (accordions.value[group_key] === undefined) {
      return undefined
    }
    return accordions.value[group_key][index_key]
  }

  function getOrInitEntry(group_key: string, index_key: string): any {
    if (typeof group_key !== 'string' || group_key.trim() === '') {
      throw new Error('group_key must be a non-blank string')
    }
    if (typeof index_key !== 'string' || index_key.trim() === '') {
      throw new Error('index_key must be a non-blank string')
    }

    if (!Object.keys(accordions.value).includes(group_key)) {
      accordions.value[group_key] = {}
    }

    if (!Object.keys(accordions.value[group_key]).includes(index_key)) {
      accordions.value[group_key][index_key] = {}
    }

    return accordions.value[group_key][index_key]
  }

  function upsert(accordion: any) {
    const accordionDataPointer = getOrInitEntry(accordion.group_key, accordion.index_key)
    accordionDataPointer['index_position'] = accordion.index_position
    accordionDataPointer['open'] = accordion.open

    storeToStorage()
  }

  function upsertWholeGroup(groupKey: string, accordionData: any) {
    Object.entries(accordionData).forEach(([key, value]: any) => {
      if (
        !Object.prototype.hasOwnProperty.call(value, 'index_position') ||
        !Object.prototype.hasOwnProperty.call(value, 'open')
      ) {
        console.warn('some accordions data is missing index_position or open data')
      }
    })
    accordions.value[groupKey] = accordionData
    storeToStorage()
  }

  function restoreData(data: any) {
    accordions.value = data
    storeToStorage()
  }

  return {
    accordions,
    init,
    upsert,
    getGroup,
    getIndex,
    restoreData,
    upsertWholeGroup,
  }
})