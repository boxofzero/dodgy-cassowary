import gameWeaponRawData from '@/data/game/raw/weapon.json'

export interface Materials {
  [key: string]: number | {
    [tier: number]: number
  }
}

export interface LevelMaterials {
  level: string
  materials: Materials
}

export type WeaponRarity = 3 | 4 | 5

export const weaponLevellingMaterialsCount: Record<WeaponRarity, LevelMaterials[]> = {
  3: [
    { level: '1', materials: {} },
    { level: '20', materials: { weapon_exp: 24660, shell_credit: 9864 } },
    {
      level: '20A',
      materials: {
        tiered_enemy_drop_weapon_skill_material: {
          1: 4,
        },
        shell_credit: 6000,
      },
    },
    { level: '40', materials: { weapon_exp: 95340, shell_credit: 38136 } },
    {
      level: '40A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          1: 4,
        },
        tiered_enemy_drop_weapon_skill_material: {
          2: 4,
        },
        shell_credit: 12000,
      },
    },
    { level: '50', materials: { weapon_exp: 94440, shell_credit: 37776 } },
    {
      level: '50A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          2: 5,
        },
        tiered_enemy_drop_weapon_skill_material: {
          3: 3,
        },
        shell_credit: 24000,
      },
    },
    { level: '60', materials: { weapon_exp: 142260, shell_credit: 56904 } },
    {
      level: '60A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          3: 4,
        },
        tiered_enemy_drop_weapon_skill_material: {
          3: 4,
        },
        shell_credit: 36000,
      },
    },
    { level: '70', materials: { weapon_exp: 207600, shell_credit: 83040 } },
    {
      level: '70A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          4: 5,
        },
        tiered_enemy_drop_weapon_skill_material: {
          4: 3,
        },
        shell_credit: 48000,
      },
    },
    { level: '80', materials: { weapon_exp: 296880, shell_credit: 118752 } },
    {
      level: '80A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          4: 8,
        },
        tiered_enemy_drop_weapon_skill_material: {
          4: 5,
        },
        shell_credit: 72000,
      },
    },
    { level: '90', materials: { weapon_exp: 512340, shell_credit: 204936 } },
  ],
  4: [
    { level: '1', materials: {} },
    { level: '20', materials: { weapon_exp: 41100, shell_credit: 16440 } },
    {
      level: '20A',
      materials: {
        tiered_enemy_drop_weapon_skill_material: {
          1: 5,
        },
        shell_credit: 8000,
      },
    },
    { level: '40', materials: { weapon_exp: 158900, shell_credit: 63560 } },
    {
      level: '40A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          1: 5,
        },
        tiered_enemy_drop_weapon_skill_material: {
          2: 5,
        },
        shell_credit: 16000,
      },
    },
    { level: '50', materials: { weapon_exp: 157400, shell_credit: 62960 } },
    {
      level: '50A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          2: 7,
        },
        tiered_enemy_drop_weapon_skill_material: {
          3: 4,
        },
        shell_credit: 32000,
      },
    },
    { level: '60', materials: { weapon_exp: 237100, shell_credit: 94840 } },
    {
      level: '60A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          3: 5,
        },
        tiered_enemy_drop_weapon_skill_material: {
          3: 5,
        },
        shell_credit: 48000,
      },
    },
    { level: '70', materials: { weapon_exp: 346000, shell_credit: 138400 } },
    {
      level: '70A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          4: 7,
        },
        tiered_enemy_drop_weapon_skill_material: {
          4: 4,
        },
        shell_credit: 64000,
      },
    },
    { level: '80', materials: { weapon_exp: 494800, shell_credit: 197920 } },
    {
      level: '80A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          4: 10,
        },
        tiered_enemy_drop_weapon_skill_material: {
          4: 7,
        },
        shell_credit: 96000,
      },
    },
    { level: '90', materials: { weapon_exp: 853900, shell_credit: 341560 } },
  ],
  5: [
    { level: '1', materials: {} },
    { level: '20', materials: { weapon_exp: 43300, shell_credit: 17320 } },
    {
      level: '20A',
      materials: {
        tiered_enemy_drop_weapon_skill_material: {
          1: 6,
        },
        shell_credit: 10000,
      },
    },
    { level: '40', materials: { weapon_exp: 198900, shell_credit: 79560 } },
    {
      level: '40A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          1: 6,
        },
        tiered_enemy_drop_weapon_skill_material: {
          2: 6,
        },
        shell_credit: 20000,
      },
    },
    { level: '50', materials: { weapon_exp: 209000, shell_credit: 83600 } },
    {
      level: '50A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          2: 8,
        },
        tiered_enemy_drop_weapon_skill_material: {
          3: 4,
        },
        shell_credit: 40000,
      },
    },
    { level: '60', materials: { weapon_exp: 314100, shell_credit: 125640 } },
    {
      level: '60A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          3: 6,
        },
        tiered_enemy_drop_weapon_skill_material: {
          3: 6,
        },
        shell_credit: 60000,
      },
    },
    { level: '70', materials: { weapon_exp: 446600, shell_credit: 178640 } },
    {
      level: '70A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          4: 8,
        },
        tiered_enemy_drop_weapon_skill_material: {
          4: 4,
        },
        shell_credit: 80000,
      },
    },
    { level: '80', materials: { weapon_exp: 610900, shell_credit: 244360 } },
    {
      level: '80A',
      materials: {
        tiered_forgery_weapon_skill_material: {
          4: 12,
        },
        tiered_enemy_drop_weapon_skill_material: {
          4: 8,
        },
        shell_credit: 120000,
      },
    },
    { level: '90', materials: { weapon_exp: 869600, shell_credit: 347840 } },
  ],
}

export const weapons = gameWeaponRawData