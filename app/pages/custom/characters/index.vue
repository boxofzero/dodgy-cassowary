<template>
	<section class="flex justify-between items-center mb-5">
		<h1 class="font-extrabold text-4xl">Custom Characters</h1>
		<UButton
			color="primary"
			variant="solid"
			@click="navigateTo('/custom/characters/new')"
		>
			Add New
		</UButton>
	</section>
	<section>
		<div class="flex flex-wrap items-center gap-5">
			<h2>CHARACTER NAME</h2>
			<UInputMenu
				v-model="characterName"
				:items="customCharacterList"
				:filter-fields="['title']"
				size="xl"
				class="w-3/4"
				:ui="{ item: 'p-4' }"
			>
				<template #item-label="{ item }">
					<div class="flex justify-between items-center">
						<span>{{ item.title }}</span>
						<UBadge :label="item.weapon_type" color="gray" />
					</div>
				</template>
			</UInputMenu>
		</div>
		<section v-show="isCharacterNameSet">
			<USeparator label="LEVEL" />
			<div class="">
				<div class="items-center gap-5 grid grid-cols-4">
					<span>Current Level</span>
					<USelect
						:items="levelItems"
						v-model="character['char_current_level']"
						:model-value="character['char_current_level'] || 1"
						@change="upsertPlannedCustomCharacter(characterName)"
					/>
					<span>Target Level</span>
					<USelect
						:items="levelItems"
						v-model="character['char_target_level']"
						:model-value="character['char_target_level'] || 1"
						@change="upsertPlannedCustomCharacter(characterName)"
					/>
				</div>
			</div>

			<USeparator label="SKILLS" />
			<div class="flex flex-row gap-2">
				<div class="p-1 border-gray-800 border-r border-solid basis-3/5">
					<h2>ACTIVE SKILLS</h2>
					<div v-for="(item, index) in activeSkills" :key="index">
						<div class="gap-2 grid grid-cols-5 grid-flow-col auto-cols-max">
							<span class="col-span-2">{{ item.label }}:</span>
							<label>Current Level</label>
							<UInput
								type="number"
								:min="1"
								:max="10"
								v-model="character[item.model_value + '_current_level']"
								:model-value="
									character[item.model_value + '_current_level'] || 1
								"
								@change="upsertPlannedCustomCharacter(characterName)"
							/>
							<label>Target Level</label>
							<UInput
								type="number"
								:min="1"
								:max="10"
								v-model="character[item.model_value + '_target_level']"
								:model-value="
									character[item.model_value + '_target_level'] || 1
								"
								@change="upsertPlannedCustomCharacter(characterName)"
							/>
						</div>
					</div>
				</div>
				<div class="p-1 basis-2/5">
					<h2>PASSIVE SKILLS</h2>
					<div class="flex flex-row justify-between items-center gap-2">
						<div
							v-for="(item, index) in passiveSkills"
							:key="index"
							class="w-full"
						>
							<div
								class=""
								v-for="passiveSkill of item.data"
								:key="passiveSkill.model_value"
							>
								<div
									class="items-center gap-2 grid grid-cols-2 grid-flow-col auto-cols-max"
								>
									<label class="col-span-2"
										>{{ item.label }} {{ passiveSkill.label }}</label
									>
									<USwitch
										color="primary"
										v-model="character[passiveSkill.model_value]"
										:model-value="character[passiveSkill.model_value]"
										@change="upsertPlannedCustomCharacter(characterName)"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<USeparator label="ACTIONS" />
			<section class="p-3">
				<UButton
					class="mr-3"
					color="error"
					variant="solid"
					@click="removeCharacter"
					:disabled="!isCharacterNameSet"
				>
					Remove
				</UButton>
			</section>
		</section>
	</section>
</template>

<script setup lang="ts">
import * as dbPlannedCustomCharacter from '~/data/database/dbPlannedCustomCharacter';
import {
	levelItems,
	activeSkills,
	passiveSkills,
} from '~/data/form/characters/formCharactersNew';
import { usePlannedCustomCharacterStore } from '@/stores/plannedCustomCharacterStore';
import * as objectHelper from '@/libraries/objectHelper';

interface CustomCharacterListItem {
	title: string;
	value: string;
	weapon_type: string;
}

const customCharacterList = computed((): CustomCharacterListItem[] => {
	const characters = usePlannedCustomCharacterStore().getAll();
	return Object.entries(characters).map(([key, value]: [string, any]) => ({
		title: key,
		value: key,
		weapon_type: value.weapon_type || '',
	}));
});

const characterName = ref<string | undefined>(undefined);
const isCharacterNameSet = computed(() => {
	return !!characterName.value;
});

const route = useRoute();
const toast = useToast();

const character = ref({ ...dbPlannedCustomCharacter.customCharacter });

watch(characterName, async () => {
	console.log(
		'characterName watcher: changed: ' + JSON.stringify(characterName.value)
	);

	const urlHash = route.hash.slice(1);
	if (
		urlHash !== undefined &&
		urlHash !== characterName.value
	) {
		getOrInitPlannedCustomCharacter(characterName.value!);
		await navigateTo({ hash: '#' + characterName.value });
	}
});

const doEmit = (a: string) => {
	console.log('emit received: ' + a);
	getOrInitPlannedCustomCharacter(characterName.value!);
};

function upsertPlannedCustomCharacter() {
	useDebounceFn(() => {
		if (!characterName.value || !character.value['name']) {
			return;
		}
		usePlannedCustomCharacterStore().upsert(
			character.value['name'],
			objectHelper.omit(character.value, 'name')
		);
	}, 100)().then(() => {
		if (!characterName.value) {
			return;
		}
		toast.add({
			title: 'Custom Character ' + characterName.value + ' updated',
			icon: 'i-heroicons-check-badge',
			duration: 2000,
		});
	});
}

function removeCharacter() {
	usePlannedCustomCharacterStore().remove(characterName.value!);
	characterName.value = undefined;
	character.value = { ...dbPlannedCustomCharacter.customCharacter };
	toast.add({
		title: 'Character removed',
		icon: 'i-heroicons-check-badge',
		duration: 2000,
	});
}

function initCharacterFromHash() {
	const urlHash = route.hash.slice(1);

	if (urlHash !== undefined) {
		const found = customCharacterList.value.find(
			(item) => item.value === urlHash
		);
		if (found) {
			characterName.value = found.value;
			getOrInitPlannedCustomCharacter(found.value);
		}
	}
}

function getOrInitPlannedCustomCharacter(name: string) {
	character.value = usePlannedCustomCharacterStore().getOrInitEntry(name);
	character.value['name'] = name;
}

onBeforeMount(() => {
	usePlannedCustomCharacterStore().init();
	initCharacterFromHash();
});
</script>