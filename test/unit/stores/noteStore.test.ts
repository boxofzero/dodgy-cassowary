import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNoteStore } from '~/stores/noteStore';

let mockStorage: Record<string, { value: any }> = {};

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: any) => {
    if (!mockStorage[key]) {
      mockStorage[key] = { value: defaultValue || {} };
    }
    return mockStorage[key];
  }),
}));

vi.mock('@/data/database/dbNote', () => ({
  note: {
    title: '',
    description: '',
  },
}));

describe('noteStore', () => {
  let noteStore: ReturnType<typeof useNoteStore>;

  beforeEach(() => {
    mockStorage = {};
    setActivePinia(createPinia());
    noteStore = useNoteStore();
    noteStore.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('init loads notes from storage', () => {
    expect(noteStore.notes).toBeDefined();
  });

  it('getOrInitEntry returns default note object for new id', () => {
    const note = noteStore.getOrInitEntry('1');
    expect(note).toEqual({
      title: '',
      description: '',
    });
  });

  it('getOrInitEntry returns existing note for known id', () => {
    noteStore.notes['1'] = { title: 'Test', description: 'Desc' };
    const note = noteStore.getOrInitEntry('1');
    expect(note.title).toBe('Test');
  });

  it('getLastId returns 0 when no notes exist', () => {
    expect(noteStore.getLastId()).toBe(0);
  });

  it('getLastId returns highest id when notes exist', () => {
    noteStore.notes['1'] = {};
    noteStore.notes['2'] = {};
    noteStore.notes['3'] = {};
    expect(noteStore.getLastId()).toBe(3);
  });

  it('upsert creates new note with auto-generated id', () => {
    const note = { title: 'New Note', description: 'Content' };
    noteStore.upsert(note);
    expect(noteStore.notes['1']).toBeDefined();
    expect(noteStore.notes['1'].title).toBe('New Note');
    expect(note.id).toBe(1);
  });

  it('upsert updates existing note', () => {
    noteStore.notes['1'] = { title: 'Old', description: 'Old', updated_at: '2025-01-01' };
    const note = { id: 1, title: 'Updated', description: 'New Content' };
    noteStore.upsert(note);
    expect(noteStore.notes['1'].updated_at).not.toBe('2025-01-01');
  });

  it('deleteNote removes note by id', () => {
    noteStore.notes['1'] = { title: 'Test' };
    noteStore.deleteNote('1');
    expect(noteStore.notes['1']).toBeUndefined();
  });

  it('deleteNote does nothing for non-existent id', () => {
    noteStore.notes['1'] = { title: 'Test' };
    noteStore.deleteNote('999');
    expect(noteStore.notes['1']).toBeDefined();
  });

  it('restoreData replaces all notes', () => {
    noteStore.notes['1'] = {};
    noteStore.restoreData({ '2': { title: 'Restored' } });
    expect(noteStore.notes['1']).toBeUndefined();
    expect(noteStore.notes['2'].title).toBe('Restored');
  });
});
