import { characters } from '~/data/game/gameCharacter';
import * as dbPlannedCharacter from '~/data/database/dbPlannedCharacter';
import {
	levelItems,
	activeSkills,
	passiveSkills,
} from '~/data/form/characters/formCharactersNew';
import { usePlannedCharacterStore } from '@/stores/plannedCharacterStore';
import * as characterService from '@/services/characterService';
import * as inventoryService from '@/services/inventoryService';
import * as plannerService from '@/services/plannerService';
import * as stringHelper from '@/libraries/stringHelper';
import * as arrayHelper from '@/libraries/arrayHelper';
import * as objectHelper from '@/libraries/objectHelper';

export interface CharacterListItem {
	id: string;
	label: string;
	avatar: { src: string; alt: string };
	title: string;
	value: string;
	type: string;
	rarity: number;
}

export function characterList(): CharacterListItem[] {
	let list: CharacterListItem[] = [];
	Object.entries(characters).forEach(function (
		[characterName, character],
		index
	) {
		const subtitle =
			' (' +
			character.rarity +
			'⭐ ' +
			stringHelper.capitalize(character.weapon) +
			')';
		list = list.concat({
			id: characterName,
			label: character.display_name,
			avatar: { src: character.icon, alt: character.display_name },
			title: character.display_name + ' ' + subtitle,
			value: characterName,
			type: character.weapon,
			rarity: character.rarity,
		});
	});
	list = arrayHelper.orderBy(
		list,
		['type', 'rarity', 'label'],
		['asc', 'asc', 'asc']
	);
	return list;
}

const characterName = ref<CharacterListItem | undefined>(undefined);
const isCharacterNameSet = computed(() => {
	return !!characterName.value;
});

watch(characterName, async () => {
	console.log(
		'characterName watcher: changed: ' + JSON.stringify(characterName.value)
	);

	// redirect if url hash is not set
	const urlHash = route.hash.slice(1);
	if (
		urlHash !== undefined &&
		urlHash !== characterName.value?.id &&
		objectHelper.has(characters, urlHash)
	) {
		getOrInitPlannedCharacter(urlHash);
		console.log('redirecting...');
		await navigateTo({ hash: '#' + urlHash });
	}
});

const character = ref<dbPlannedCharacter.PlannedCharacter>({ ...dbPlannedCharacter.character });
const materials = ref<Record<string, unknown>>({});
const isMaterialsExist = computed(() => {
	return Object.keys(materials.value).length > 0;
});

const doEmit = (a: string) => {
	console.log('emit received: ' + a);
	getOrInitPlannedCharacter(characterName.value!.id);
};

export function getOrInitPlannedCharacter(name: string): void {
	character.value = usePlannedCharacterStore().getOrInitEntry(name);
	character.value.name = name;

	materials.value = getNeededMaterials(name);
}

const toast = useToast();

export function upsertPlannedCharacter(): void {
	useDebounceFn(() => {
		if (!characterName.value || !character.value.name) {
			return;
		}
		usePlannedCharacterStore().upsert(
			character.value.name,
			objectHelper.omit(character.value as Record<string, unknown>, 'name')
		);
	}, 100)().then(() => {
		if (!characterName.value) {
			return;
		}
		toast.add({
			title:
				'Character ' +
				characters[characterName.value.id].display_name +
				' updated to LocalStorage',
			icon: 'i-heroicons-check-badge',
			duration: 2000,
		});
		materials.value = getNeededMaterials(characterName.value.id);
	});
}

export const getNeededMaterials = (name: string): Record<string, unknown> => {
	const neededMaterials = characterService.getCharacterNeededMaterials(name);
	const ownedNeededMaterialsResponseData =
		inventoryService.getOwnedNeededMaterialsResponseData(neededMaterials);
	return ownedNeededMaterialsResponseData;
};

const setDone = () => {
	useDebounceFn(() => {
		plannerService.setCharacterDone(character.value, materials.value);
	}, 100)().then(() => {
		getOrInitPlannedCharacter(characterName.value!.id);
	});
};

const route = useRoute();

function initCharacterFromHash(): void {
	// get character name from url hash
	const urlHash = route.hash.slice(1);

	if (urlHash !== undefined && objectHelper.has(characters, urlHash)) {
		characterName.value = characterList().find(
			(item) => item.value === urlHash
		);
		if (characterName.value) {
			getOrInitPlannedCharacter(characterName.value.id);
		}
	}
}

onBeforeMount(() => {
	// init store
	usePlannedCharacterStore().init();

	// init char if url has hash
	initCharacterFromHash();
});
