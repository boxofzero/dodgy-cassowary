import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlannedWeaponStore } from '~/stores/plannedWeaponStore';

let mockStorage: Record<string, { value: any }> = {};

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: any) => {
    if (!mockStorage[key]) {
      mockStorage[key] = { value: defaultValue || {} };
    }
    return mockStorage[key];
  }),
}));

vi.mock('@/data/database/dbPlannedWeapon', () => ({
  weapon: {
    name: '',
    weap_current_level: '1',
    weap_target_level: '1',
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

describe('plannedWeaponStore', () => {
  let store: ReturnType<typeof usePlannedWeaponStore>;

  beforeEach(() => {
    mockStorage = {};
    setActivePinia(createPinia());
    store = usePlannedWeaponStore();
    store.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('init loads planned weapons from storage', () => {
    expect(store.plannedWeapons).toBeDefined();
  });

  it('getOrInitEntry returns default for new weapon', () => {
    const weapon = store.getOrInitEntry('newWeapon');
    expect(weapon).toEqual({
      name: '',
      weap_current_level: '1',
      weap_target_level: '1',
    });
  });

  it('getOrInitEntry returns existing weapon', () => {
    store.plannedWeapons['exists'] = { name: 'Test' };
    const weapon = store.getOrInitEntry('exists');
    expect(weapon.name).toBe('Test');
  });

  it('getWeapons returns multiple weapons', () => {
    const weapons = store.getWeapons(['weapon1', 'weapon2']);
    expect(Object.keys(weapons)).toHaveLength(2);
  });

  it('upsert creates new weapon with timestamps', () => {
    store.upsert('newWeapon', { name: 'Test', weap_current_level: '1' });
    expect(store.plannedWeapons['newWeapon']).toBeDefined();
    expect(store.plannedWeapons['newWeapon'].created_at).toBeDefined();
  });

  it('upsert updates existing weapon', () => {
    store.plannedWeapons['weapon1'] = { name: 'Old', created_at: '2025-01-01' };
    store.upsert('weapon1', { weap_target_level: '50' });
    expect(store.plannedWeapons['weapon1'].updated_at).toBeDefined();
  });

  it('setDone removes weapon when done', () => {
    store.plannedWeapons['weapon1'] = { weap_current_level: '50', weap_target_level: '50' };
    store.setDone('weapon1');
    expect(store.plannedWeapons['weapon1']).toBeUndefined();
  });

  it('setDone handles undefined weapon', () => {
    expect(() => store.setDone('nonexistent')).not.toThrow();
  });

  it('isWeaponDone returns true for undefined weapon', () => {
    expect(store.isWeaponDone('nonexistent')).toBe(true);
  });

  it('isWeaponDone returns true when target not higher than current', () => {
    store.plannedWeapons['weapon1'] = { weap_current_level: '50', weap_target_level: '50' };
    expect(store.isWeaponDone('weapon1')).toBe(true);
  });

  it('isWeaponDone returns false when target higher than current', () => {
    store.plannedWeapons['weapon1'] = { weap_current_level: '1', weap_target_level: '50' };
    expect(store.isWeaponDone('weapon1')).toBe(false);
  });

  it('getAllActivePlannedWeapons returns only incomplete', () => {
    store.plannedWeapons['weapon1'] = { weap_current_level: '1', weap_target_level: '50' };
    store.plannedWeapons['weapon2'] = { weap_current_level: '50', weap_target_level: '50' };
    const active = store.getAllActivePlannedWeapons();
    expect(Object.keys(active)).toHaveLength(1);
    expect(active['weapon1']).toBeDefined();
  });

  it('restoreData replaces all planned weapons', () => {
    store.plannedWeapons['old'] = {};
    store.restoreData({ new: { name: 'Restored' } });
    expect(store.plannedWeapons.old).toBeUndefined();
    expect(store.plannedWeapons.new.name).toBe('Restored');
  });
});
