import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInventoryItemStore } from '~/stores/inventoryItemStore';

let mockStorage: Record<string, { value: any }> = {};

vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: any) => {
    if (!mockStorage[key]) {
      mockStorage[key] = { value: defaultValue || {} };
    }
    return mockStorage[key];
  }),
  useDebounceFn: vi.fn((fn: Function) => fn),
}));

vi.mock('@/data/database/dbInventoryItem', () => ({
  dbInventoryItems: {
    basic_energy_core: { count: 0 },
    medium_energy_core: { count: 0 },
  },
}));

describe('inventoryItemStore', () => {
  let store: ReturnType<typeof useInventoryItemStore>;

  beforeEach(() => {
    mockStorage = {};
    setActivePinia(createPinia());
    store = useInventoryItemStore();
    store.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('init loads inventory items from storage', () => {
    expect(store.inventoryItems).toBeDefined();
  });

  it('get returns item with count', () => {
    store.inventoryItems['test_item'] = { count: 10 };
    const item = store.get('test_item');
    expect(item.count).toBe(10);
  });

  it('get creates default for non-existent item', () => {
    const item = store.get('new_item');
    expect(item.count).toBe(0);
  });

  it('updateInventory updates item count', () => {
    store.updateInventory('test_item', 50);
    expect(store.inventoryItems.test_item.count).toBe(50);
  });

  it('updateInventory parses string to int', () => {
    store.updateInventory('test_item', '100');
    expect(store.inventoryItems.test_item.count).toBe(100);
  });

  it('decreaseTieredMaterial decreases count', () => {
    store.inventoryItems['basic_energy_core'] = { count: 50 };
    store.decreaseTieredMaterial('basic_energy_core', 20);
    expect(store.inventoryItems.basic_energy_core.count).toBe(30);
  });

  it('decreaseTieredMaterial does nothing for non-synthesizable', () => {
    store.inventoryItems['regular_item'] = { count: 50 };
    store.decreaseTieredMaterial('regular_item', 20);
    expect(store.inventoryItems.regular_item.count).toBe(50);
  });

  it('decreaseTieredMaterial caps at zero', () => {
    store.inventoryItems['basic_energy_core'] = { count: 10 };
    store.decreaseTieredMaterial('basic_energy_core', 20);
    expect(store.inventoryItems.basic_energy_core.count).toBe(0);
  });

  it('restoreData replaces all inventory items', () => {
    store.inventoryItems['old'] = { count: 10 };
    store.restoreData({ new: { count: 50 } });
    expect(store.inventoryItems.old).toBeUndefined();
    expect(store.inventoryItems.new.count).toBe(50);
  });
});
