import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAccordionStore } from '~/stores/accordionStore';

let mockStorage: Record<string, { value: any }> = {};

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: any) => {
    if (!mockStorage[key]) {
      mockStorage[key] = { value: defaultValue || {} };
    }
    return mockStorage[key];
  }),
}));

describe('accordionStore', () => {
  let accordionStore: ReturnType<typeof useAccordionStore>;

  beforeEach(() => {
    mockStorage = {};
    setActivePinia(createPinia());
    accordionStore = useAccordionStore();
    accordionStore.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('init loads accordions from storage', () => {
    expect(accordionStore.accordions).toBeDefined();
  });

  it('getGroup returns undefined for non-existent group', () => {
    expect(accordionStore.getGroup('nonexistent')).toBeUndefined();
  });

  it('getGroup returns group when exists', () => {
    accordionStore.accordions['group1'] = { open: true };
    expect(accordionStore.getGroup('group1')).toEqual({ open: true });
  });

  it('getIndex returns undefined for non-existent group', () => {
    expect(accordionStore.getIndex('group1', 'index1')).toBeUndefined();
  });

  it('getIndex returns index when exists', () => {
    accordionStore.accordions['group1'] = { index1: { open: true } };
    expect(accordionStore.getIndex('group1', 'index1')).toEqual({ open: true });
  });

  it('upsert creates new group and index', () => {
    accordionStore.upsert({
      group_key: 'group1',
      index_key: 'index1',
      index_position: 0,
      open: true,
    });
    expect(accordionStore.accordions['group1']['index1']).toBeDefined();
  });

  it('getOrInitEntry throws for blank group_key', () => {
    expect(() => accordionStore.getOrInitEntry('', 'index1')).toThrow();
  });

  it('getOrInitEntry throws for blank index_key', () => {
    expect(() => accordionStore.getOrInitEntry('group1', '')).toThrow();
  });

  it('upsert updates group and index', () => {
    accordionStore.upsert({
      group_key: 'group1',
      index_key: 'index1',
      index_position: 0,
      open: true,
    });
    expect(accordionStore.accordions['group1']['index1'].open).toBe(true);
    expect(accordionStore.accordions['group1']['index1'].index_position).toBe(0);
  });

  it('upsertWholeGroup replaces entire group', () => {
    accordionStore.accordions['group1'] = { old: {} };
    accordionStore.upsertWholeGroup('group1', {
      newIndex: { index_position: 1, open: true },
    });
    expect(accordionStore.accordions['group1'].old).toBeUndefined();
    expect(accordionStore.accordions['group1'].newIndex.index_position).toBe(1);
  });

  it('restoreData replaces all accordions', () => {
    accordionStore.accordions['old'] = {};
    accordionStore.restoreData({ group1: { index1: { open: true } } });
    expect(accordionStore.accordions.old).toBeUndefined();
    expect(accordionStore.accordions.group1.index1.open).toBe(true);
  });
});
