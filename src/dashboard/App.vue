<template>
	<div v-if="splashscreen" class="splashscreen">
		<img src="/img/logo.png" width="150" alt="" />
	</div>
	<div class="app">
		<title-bar v-show="!splashscreen" />
		<page-header v-show="!splashscreen" @save="save" />
		<div class="dashboard" v-show="!splashscreen">
			<div :class="`pages${store.formWallpaper ? ' second-page' : ''}`">
				<div class="main">
					<add-wallpapers />
				</div>
				<wallpaper-form ref="form" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, onMounted, computed } from 'vue';
import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

import TitleBar from '@/dashboard/components/TitleBar.vue';
import PageHeader from '@/dashboard/components/PageHeader.vue';
import AddWallpapers from '@/dashboard/components/AddWallpapers.vue';
import WallpaperForm from '@/dashboard/form/WallpaperForm.vue';

const splashscreen = ref(true);

const form = useTemplateRef('form');

const save = () => {
	if (form.value) form.value.save();
};

onMounted(() => {
	setTimeout(() => document.body.classList.add('ready'), 2000);
	setTimeout(() => (splashscreen.value = false), 3000);
});
</script>

<style scoped>
#app .app {
	display: flex;
	flex-direction: column;
	font-size: 14px;
}

#app .app .dashboard {
	flex: 1;
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

#app .app .pages > * {
	height: calc(100% - 20px);
	padding-inline: 20px;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
