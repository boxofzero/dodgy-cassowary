import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlannedCharacterStore } from '~/stores/plannedCharacterStore';

let mockStorage: Record<string, { value: any }> = {};

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: any) => {
    if (!mockStorage[key]) {
      mockStorage[key] = { value: defaultValue || {} };
    }
    return mockStorage[key];
  }),
}));

vi.mock('@/data/database/dbPlannedCharacter', () => ({
  character: {
    name: '',
    char_current_level: '1',
    char_target_level: '1',
    basic_attack_current_level: 1,
    basic_attack_target_level: 1,
  },
  characterStructure: {
    active_skills: ['char', 'basic_attack', 'resonance_skill'],
    passive_skills: ['passive_skill_1'],
  },
}));

vi.mock('@/libraries/objectHelper', () => ({
  omit: (obj: Record<string, any>, ...keys: string[]) => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!keys.includes(key)) {
        result[key] = value;
      }
    }
    return result;
  },
}));

describe('plannedCharacterStore', () => {
  let store: ReturnType<typeof usePlannedCharacterStore>;

  beforeEach(() => {
    mockStorage = {};
    setActivePinia(createPinia());
    store = usePlannedCharacterStore();
    store.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('init loads planned characters from storage', () => {
    expect(store.plannedCharacters).toBeDefined();
  });

  it('getOrInitEntry returns default for new character', () => {
    const char = store.getOrInitEntry('newChar');
    expect(char).toEqual({
      name: '',
      char_current_level: '1',
      char_target_level: '1',
      basic_attack_current_level: 1,
      basic_attack_target_level: 1,
    });
  });

  it('getOrInitEntry returns existing character', () => {
    store.plannedCharacters['exists'] = { name: 'Test' };
    const char = store.getOrInitEntry('exists');
    expect(char.name).toBe('Test');
  });

  it('getCharacters returns multiple characters', () => {
    const chars = store.getCharacters(['char1', 'char2']);
    expect(Object.keys(chars)).toHaveLength(2);
  });

  it('upsert creates new character with timestamps', () => {
    store.upsert('newChar', { name: 'Test', char_current_level: '1' });
    expect(store.plannedCharacters['newChar']).toBeDefined();
    expect(store.plannedCharacters['newChar'].created_at).toBeDefined();
  });

  it('upsert updates existing character', () => {
    store.plannedCharacters['char1'] = { name: 'Old', created_at: '2025-01-01' };
    store.upsert('char1', { char_target_level: '50' });
    expect(store.plannedCharacters['char1'].updated_at).toBeDefined();
  });

  it('setDone removes character when done', () => {
    store.plannedCharacters['char1'] = { char_current_level: '50', char_target_level: '50' };
    store.setDone('char1');
    expect(store.plannedCharacters['char1']).toBeUndefined();
  });

  it('setDone handles undefined character', () => {
    expect(() => store.setDone('nonexistent')).not.toThrow();
  });

  it('isCharacterDone returns true for undefined character', () => {
    expect(store.isCharacterDone('nonexistent')).toBe(true);
  });

  it('isCharacterDone returns true when target not higher than current', () => {
    store.plannedCharacters['char1'] = { char_current_level: '50', char_target_level: '50' };
    expect(store.isCharacterDone('char1')).toBe(true);
  });

  it('isCharacterDone returns false when target higher than current', () => {
    store.plannedCharacters['char1'] = { char_current_level: '1', char_target_level: '50' };
    expect(store.isCharacterDone('char1')).toBe(false);
  });

  it('getAllActivePlannedCharacters returns only incomplete', () => {
    store.plannedCharacters['char1'] = { char_current_level: '1', char_target_level: '50' };
    store.plannedCharacters['char2'] = { char_current_level: '50', char_target_level: '50' };
    const active = store.getAllActivePlannedCharacters();
    expect(Object.keys(active)).toHaveLength(1);
    expect(active['char1']).toBeDefined();
  });

  it('restoreData replaces all planned characters', () => {
    store.plannedCharacters['old'] = {};
    store.restoreData({ new: { name: 'Restored' } });
    expect(store.plannedCharacters.old).toBeUndefined();
    expect(store.plannedCharacters.new.name).toBe('Restored');
  });
});
