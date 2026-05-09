<template>
	<UApp>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>

<script setup>
useHead({
	title: 'Dodgy-Cassowary : Wuthering Waves Planner',
	meta: [
		{
			name: 'description',
			content: 'Dodgy-Cassowary : Wuthering Waves Planner',
		},
	],

	link: [
		{
			rel: 'icon',
			type: 'image/x-icon',
			href: useRuntimeConfig().app.baseURL + 'favicon.ico',
		},
	],
});
</script>
