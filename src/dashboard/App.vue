<template>
	<div v-if="splashscreen" class="splashscreen">
		<img src="/img/logo.png" width="150" alt="" />
	</div>
	<div class="app">
		<title-bar v-show="!splashscreen" />
		<page-header v-show="!splashscreen" :visible="visible" @open="open" @save="save" />
		<div class="dashboard" v-show="!splashscreen">
			<div :class="`pages${store.formWallpaper ? ' page-2' : ''}`">
				<div class="main">
					<new-wallpaper :visible="visible" @close="open(false)" />
					<wallpapers-list />
				</div>
				<wallpaper-form ref="form" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, onMounted } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { useWallpaperStore } from '@/dashboard/store';
const store = useWallpaperStore();

import TitleBar from '@/dashboard/components/TitleBar.vue';
import PageHeader from '@/dashboard/components/PageHeader.vue';
import WallpapersList from '@/dashboard/components/WallpapersList.vue';
import NewWallpaper from '@/dashboard/components/NewWallpaper.vue';
import WallpaperForm from '@/dashboard/form/WallpaperForm.vue';

const splashscreen = ref(true);

const visible = ref(false);

const form = useTemplateRef('form');

const open = (value: boolean) => {
	visible.value = value;
};

const save = () => {
	if (form.value) form.value.save();
};

onMounted(async () => {
	NovaWallpaper.database.on('refresh', () => store.readData());
	await Promise.all([store.readData(), new Promise((resolve) => setTimeout(resolve, 1500))]);
	if (!store.wallpapers.length) visible.value = true;
	document.body.classList.add('ready');
	setTimeout(() => (splashscreen.value = false), 1000);
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
	grid-template-columns: 1fr 1fr;
	transition: transform 0.3s ease-in-out;
}

#app .app .pages.page-2 {
	transform: translateX(-100vw);
}

#app .app .pages > * {
	height: calc(100% - 20px);
	padding-inline: 20px;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
