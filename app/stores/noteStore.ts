import { useStorage } from '@vueuse/core'
import * as dbNote from '@/data/database/dbNote'

const notesRepo = () => {
  return useStorage('notes', {})
}

export const useNoteStore = defineStore('notes', () => {
  const notes = ref({}) as any

  function init() {
    notes.value = notesRepo().value
  }

  function storeToStorage() {
    notesRepo().value = notes.value
  }

  function getOrInitEntry(id: string): any {
    if (id && Object.prototype.hasOwnProperty.call(notes.value, id)) {
      return notes.value[id]
    }
    return { ...dbNote.note }
  }

  function getLastId(): number {
    const keys = Object.keys(notes.value).toSorted((a, b) => Number(a) - Number(b))
    return parseInt(keys.at(-1) ?? '0') || 0
  }

  function upsert(note: any) {
    if (note.id === undefined) {
      const id = getLastId() + 1
      note.id = id
      notes.value[id] = note
      notes.value[id]['created_at'] = new Date().toISOString()
    }
    const id = note.id
    notes.value[id]['updated_at'] = new Date().toISOString()

    storeToStorage()
  }

  function deleteNote(id: string) {
    if (!Object.prototype.hasOwnProperty.call(notes.value, id)) {
      return
    }
    delete notes.value[id]
    storeToStorage()
  }

  function restoreData(data: any) {
    notes.value = data
    storeToStorage()
  }

  return {
    notes,
    init,
    getOrInitEntry,
    getLastId,
    upsert,
    deleteNote,
    restoreData,
  }
})