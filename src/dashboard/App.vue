<template>
	<div v-if="splashscreen" class="splashscreen">
		<img alt="Vue logo" src="/imgs/logo.png" width="150" />
	</div>
	<div :class="`app font-${settings.font}`">
		<title-bar v-show="!splashscreen" />
		<page-header v-show="!splashscreen" />
		<div class="dashboard" v-show="!splashscreen">
			<add-wallpapers />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import TitleBar from '@/dashboard/components/TitleBar.vue';
import PageHeader from '@/dashboard/components/PageHeader.vue';
import AddWallpapers from '@/dashboard/components/AddWallpapers.vue';

import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

const splashscreen = ref(true);

const settings = computed(() => store.settings);

onMounted(() => {
	setTimeout(() => document.body.classList.add('ready'), 2000);
	setTimeout(() => (splashscreen.value = false), 3000);
});
</script>

<style>
#app .app:not(.font-standard):not(.font-handwritten),
#app .app.font-standard,
.font-standard:not(#app .app) {
	font-family: system-ui, 'Trebuchet MS', 'Segoe UI', Helvetica, Arial;
}

#app .app.font-handwritten,
.font-handwritten:not(#app .app) {
	font-family: cursive, 'Comic Sans MS', 'Trebuchet MS', system-ui, 'Segoe UI', Helvetica, Arial;
	font-size: 0.93em;
}
</style>
