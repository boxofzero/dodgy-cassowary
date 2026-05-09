import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlannedCustomCharacterStore } from '~/stores/plannedCustomCharacterStore';

let mockStorage: Record<string, { value: any }> = {};

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: any) => {
    if (!mockStorage[key]) {
      mockStorage[key] = { value: defaultValue || {} };
    }
    return mockStorage[key];
  }),
}));

vi.mock('@/data/database/dbPlannedCustomCharacter', () => ({
  customCharacter: {
    name: '',
    weapon_type: '',
    char_current_level: '1',
    char_target_level: '1',
    basic_attack_current_level: 1,
    basic_attack_target_level: 1,
  },
}));

describe('plannedCustomCharacterStore', () => {
  let store: ReturnType<typeof usePlannedCustomCharacterStore>;

  beforeEach(() => {
    mockStorage = {};
    setActivePinia(createPinia());
    store = usePlannedCustomCharacterStore();
    store.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('init loads custom characters from storage', () => {
    expect(store.plannedCustomCharacters).toBeDefined();
  });

  it('getOrInitEntry returns default for new character', () => {
    const char = store.getOrInitEntry('newChar');
    expect(char).toEqual({
      name: '',
      weapon_type: '',
      char_current_level: '1',
      char_target_level: '1',
      basic_attack_current_level: 1,
      basic_attack_target_level: 1,
    });
  });

  it('getOrInitEntry returns existing character', () => {
    store.plannedCustomCharacters['exists'] = { name: 'Test', weapon_type: 'blade' };
    const char = store.getOrInitEntry('exists');
    expect(char.name).toBe('Test');
  });

  it('getCustomCharacters returns multiple characters', () => {
    const chars = store.getCustomCharacters(['char1', 'char2']);
    expect(Object.keys(chars)).toHaveLength(2);
  });

  it('upsert creates new character with timestamps', () => {
    store.upsert('newChar', { name: 'Test', weapon_type: 'blade' });
    expect(store.plannedCustomCharacters['newChar']).toBeDefined();
    expect(store.plannedCustomCharacters['newChar'].weapon_type).toBe('blade');
    expect(store.plannedCustomCharacters['newChar'].created_at).toBeDefined();
  });

  it('upsert updates existing character', () => {
    store.plannedCustomCharacters['char1'] = { name: 'Old', created_at: '2025-01-01', weapon_type: 'blade' };
    store.upsert('char1', { weapon_type: 'sword' });
    expect(store.plannedCustomCharacters['char1'].weapon_type).toBe('sword');
    expect(store.plannedCustomCharacters['char1'].updated_at).toBeDefined();
  });

  it('remove deletes character', () => {
    store.plannedCustomCharacters['char1'] = { name: 'Test' };
    store.remove('char1');
    expect(store.plannedCustomCharacters['char1']).toBeUndefined();
  });

  it('getAll returns all custom characters', () => {
    store.plannedCustomCharacters['char1'] = {};
    store.plannedCustomCharacters['char2'] = {};
    const all = store.getAll();
    expect(Object.keys(all)).toHaveLength(2);
  });

  it('restoreData replaces all custom characters', () => {
    store.plannedCustomCharacters['old'] = {};
    store.restoreData({ new: { name: 'Restored' } });
    expect(store.plannedCustomCharacters.old).toBeUndefined();
    expect(store.plannedCustomCharacters.new.name).toBe('Restored');
  });
});
