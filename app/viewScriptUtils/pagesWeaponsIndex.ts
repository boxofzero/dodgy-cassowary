import { weapons } from '~/data/game/gameWeapon';
import * as dbPlannedWeapon from '@/data/database/dbPlannedWeapon';
import { levelItems } from '@/data/form/weapons/formWeaponsNew';
import { usePlannedWeaponStore } from '@/stores/plannedWeaponStore';
import * as weaponService from '@/services/weaponService';
import * as inventoryService from '@/services/inventoryService';
import * as plannerService from '@/services/plannerService';
import * as stringHelper from '@/libraries/stringHelper';
import * as arrayHelper from '@/libraries/arrayHelper';
import * as objectHelper from '@/libraries/objectHelper';

export interface WeaponListItem {
	id: string;
	label: string;
	avatar: { src: string; alt: string };
	title: string;
	value: string;
	type: string;
	rarity: number;
}

export function weaponList(): WeaponListItem[] {
	let list: WeaponListItem[] = [];
	Object.entries(weapons).forEach(function ([weaponName, weapon]) {
		const subtitle =
			' (' +
			weapon.rarity +
			'⭐ ' +
			stringHelper.capitalize(weapon.weapon_type) +
			')';
		list = list.concat({
			id: weaponName,
			label: weapon.display_name,
			avatar: { src: weapon.icon, alt: weapon.display_name },
			title: weapon.display_name + ' ' + subtitle,
			value: weaponName,
			type: weapon.weapon_type,
			rarity: weapon.rarity,
		});
	});
	list = arrayHelper.orderBy(
		list,
		['type', 'rarity', 'label'],
		['asc', 'asc', 'asc']
	);
	return list;
}

const weaponName = ref<string>('');
const isWeaponNameSet = computed(() => {
	return !!weaponName.value;
});
let weaponOption = ref<WeaponListItem | Record<string, never>>({});

const weapon = ref<dbPlannedWeapon.PlannedWeapon>({ ...dbPlannedWeapon.weapon });
const materials = ref<Record<string, unknown>>({});
const isMaterialsExist = computed(() => {
	return Object.keys(materials.value).length > 0;
});

const doEmit = (a: string) => {
	console.log('emit received: ' + a);
	getOrInitPlannedWeapon(weaponName.value);
};

const getOrInitWeaponName = async (option: WeaponListItem): Promise<void> => {
	await navigateTo({ hash: '#' + option.value });
};

const getOrInitPlannedWeapon = (name: string): void => {
	weapon.value = usePlannedWeaponStore().getOrInitEntry(name);
	weapon.value.name = name;

	materials.value = getNeededMaterials(name);
};

const toast = useToast();

const upsertPlannedWeapon = (): void => {
	useDebounceFn(() => {
		if (!weaponName.value) {
			return;
		}

		usePlannedWeaponStore().upsert(
			weapon.value.name,
			objectHelper.omit(weapon.value as Record<string, unknown>, 'name')
		);
	}, 100)().then(() => {
		if (!weaponName.value) {
			return;
		}
		toast.add({
			title:
				'Weapon ' +
				weapons[weaponName.value].display_name +
				' updated to LocalStorage',
			icon: 'i-heroicons-check-badge',
			duration: 2000,
		});
		materials.value = getNeededMaterials(weaponName.value);
	});
};

export function getNeededMaterials(name: string): Record<string, unknown> {
	const neededMaterials = weaponService.getWeaponNeededMaterials(name);
	const ownedNeededMaterialsResponseData =
		inventoryService.getOwnedNeededMaterialsResponseData(neededMaterials);
	return ownedNeededMaterialsResponseData;
}

const setDone = (): void => {
	useDebounceFn(() => {
		plannerService.setWeaponDone(weapon.value, materials.value);
	}, 100)().then(() => {
		getOrInitPlannedWeapon(weaponName.value);
	});
};

const route = useRoute();

onBeforeMount(() => {
	usePlannedWeaponStore().init();

	// get weapon name from url hash
	const urlHash = route.hash.slice(1);

	if (urlHash !== undefined && objectHelper.has(weapons, urlHash)) {
		weaponOption = weaponList().find((item) => item.value === urlHash) ?? {};
		weaponName.value = urlHash;
		getOrInitPlannedWeapon(weaponName.value);
	} else {
		weaponOption = {};
		weaponName.value = '';
	}
});
