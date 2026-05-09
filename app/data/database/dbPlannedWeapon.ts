export interface PlannedWeapon {
  name: string
  _weap_current_level: string
  _weap_target_level: string
}

export type Level = '1' | '50' | '50A' | '60' | '60A' | '70' | '70A' | '80' | '80A' | '90'

export const weapon: PlannedWeapon = {
  name: '',
  _weap_current_level: '1',
  _weap_target_level: '1',
}