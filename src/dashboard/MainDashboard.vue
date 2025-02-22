<template>
	<div class="dashboard">
		<div class="header">
			<h1>Wallpapers</h1>
			<div class="right-side">
				<button v-if="newWallpapersVisible" class="text-btn fixed" @click="setNewWallpapers('collapse')">Cancel</button>
				<button v-else class="text-btn primary fixed" @click="setNewWallpapers('expand')">Add</button>
			</div>
		</div>

		<div class="content" ref="main">
			<new-wallpaper :visible="newWallpapersVisible" @collapse="setNewWallpapers('collapse')" />
			<wallpapers-list @collapse="setNewWallpapers('collapse')" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, onMounted } from 'vue';
import { useWallpaperStore } from '@/global/store';
import { NovaWallpaper } from '@/electron-vue/preload';
import WallpapersList from '@/dashboard/components/WallpapersList.vue';
import NewWallpaper from '@/dashboard/components/NewWallpaper.vue';

const store = useWallpaperStore();

const newWallpapersVisible = ref(false);

const main = useTemplateRef('main');

const setNewWallpapers = (action: 'collapse' | 'expand') => {
	newWallpapersVisible.value = action === 'collapse' ? false : true;
	if (newWallpapersVisible.value && main.value) {
		main.value.scrollTo({ top: 0, behavior: 'smooth' });
	}
};

onMounted(async () => {
	document.documentElement.style.backgroundColor = 'var(--body-bg)';
	NovaWallpaper.database.on('refresh', () => store.readData());
	await Promise.all([store.readData(), new Promise((resolve) => setTimeout(resolve, 1500))]);
	if (!store.wallpapers.length) newWallpapersVisible.value = true;
	NovaWallpaper.window.send('show-dashboard');
});
</script>

<style scoped>
.dashboard {
	height: calc(100% - 20px);
	display: flex;
	flex-direction: column;
	font-size: 14px;
	overflow: hidden;
}

.content {
	flex: 1;
	padding-inline: 20px;
	overflow-y: auto;
	overflow-x: hidden;
}

.content > * {
	width: calc(100vw - 40px);
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 15px 20px;
	padding-bottom: 15px;
	border-bottom: 1px solid var(--border-color);
}

.right-side {
	display: flex;
	gap: 7px;
}

.text-btn {
	background-color: var(--neutral-color);
	border: none;
	border-radius: 7px;
	cursor: pointer;
	font-weight: 500;
	padding: 5px 17px;
	font-size: 13px;
	transition: background-color 0.15s ease-in-out;
}

.text-btn:hover {
	background-color: var(--neutral-hover);
}

.fixed {
	width: 85px;
}

.primary {
	background-color: var(--primary-color);
}

.primary:hover {
	background-color: var(--primary-color-active);
}
</style>
