<template>
	<div v-if="splashscreen" class="splashscreen">
		<img alt="Vue logo" src="/imgs/logo.png" width="150" />
	</div>
	<div :class="`app font-${settings.font}`">
		<title-bar v-show="!splashscreen" />
		<page-header v-show="!splashscreen" />
		<div class="dashboard" v-show="!splashscreen">
			<div :class="`pages${store.currentImporting ? ' second-page' : ''}`">
				<div class="main">
					<add-wallpapers />
				</div>
				<wallpaper-form />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import TitleBar from '@/dashboard/components/TitleBar.vue';
import PageHeader from '@/dashboard/components/PageHeader.vue';
import AddWallpapers from '@/dashboard/components/AddWallpapers.vue';
import WallpaperForm from '@/dashboard/components/WallpaperForm.vue';

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

#app .app {
	display: flex;
	flex-direction: column;
}

#app .app .dashboard {
	flex: 1;
	margin-block: 20px;
	overflow: hidden;
}

#app .app .pages {
	width: 200vw;
	height: 100%;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	transition: transform 0.3s ease-in-out;
}

#app .app .pages.second-page {
	transform: translateX(-100vw);
}
</style>
