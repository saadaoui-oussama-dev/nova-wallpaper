<template>
	<div class="wallpaper-form" v-if="wallpaper">
		<wallpaper-preview :wallpaper="wallpaper" :json="wallpaperJSON" :settings="settings" />
		<div class="section">
			<p class="title">Name:</p>
			<div class="column">
				<input v-model="label" placeholder="Wallpaper Label" maxlength="30" />
			</div>
		</div>
		<wallpaper-settings :wallpaper="wallpaper" :json="wallpaperJSON" @change="setSettings" />
		<wallpaper-query-params v-if="wallpaper.type === 'webpage'" :wallpaper="wallpaper" :json="wallpaperJSON" />
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useWallpaperStore, Wallpaper } from '@/store';
const store = useWallpaperStore();

import { getFileName, replaceFileName } from '@/global/utils';
import { NovaWallpaper } from '@/dashboard/preload';
import { JSONResponse } from '@/global/channel-types';

import WallpaperPreview from '@/dashboard/form/WallpaperPreview.vue';
import WallpaperSettings from '@/dashboard/form/WallpaperSettings.vue';
import WallpaperQueryParams from '@/dashboard/form/WallpaperQueryParams.vue';

const wallpaper = computed<Wallpaper | null>(() => store.currentImporting);

const wallpaperJSON = ref<JSONResponse | null>(null);

const label = ref(wallpaper.value ? getFileName(wallpaper.value.path, 'path', 30) : '');

watch(label, () => (label.value = getFileName(label.value, 'nameOnly', 30, false)));

const settings = ref<{ taskbar: boolean; settings: { [key: string]: string | number | boolean } }>({
	taskbar: false,
	settings: {},
});

const setSettings = (data: { taskbar: boolean; settings: { [key: string]: string | number | boolean } }) =>
	(settings.value = data);

watch(wallpaper, async () => {
	if (!wallpaper.value) {
		wallpaperJSON.value = null;
		label.value = '';
		return;
	}

	label.value = getFileName(wallpaper.value.path, 'path', 30) || '';
	if (wallpaper.value.type === 'webpage') {
		try {
			const filename = replaceFileName(wallpaper.value.path, { name: 'settings', extension: 'json' });
			const res = await NovaWallpaper.json.invoke('read', filename);
			if (res.valid) wallpaperJSON.value = res;
		} catch {
			wallpaperJSON.value = null;
			return;
		}
	}
});
</script>

<style>
.wallpaper-form .section {
	margin-bottom: 18px;
}

.wallpaper-form .section:last-child {
	margin-bottom: 0px;
}

.wallpaper-form .section > .title-container {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
}

.wallpaper-form .section > .title,
.wallpaper-form .section > .title-container .title {
	margin-bottom: 10px;
	font-size: 17px;
	font-weight: 700;
}

.wallpaper-form .section > .title .suffix,
.wallpaper-form .section > .title-container .title .suffix {
	font-size: 14px;
	font-weight: 400;
	opacity: 0.7;
}

.wallpaper-form .section .column {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
</style>
