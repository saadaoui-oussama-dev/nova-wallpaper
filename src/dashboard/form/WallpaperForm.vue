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
		<template v-if="wallpaper.type === 'webpage'">
			<wallpaper-permissions :wallpaper="wallpaper" :json="wallpaperJSON" @change="setPermissions" />
			<wallpaper-query-params :wallpaper="wallpaper" :json="wallpaperJSON" @change="setQueryParams" />
		</template>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineExpose } from 'vue';
import { useWallpaperStore, Wallpaper } from '@/store';
const store = useWallpaperStore();

import { getFileName, replaceFileName } from '@/global/utils';
import { NovaWallpaper } from '@/dashboard/preload';
import { JSONResponse } from '@/global/channel-types';

import WallpaperPreview from '@/dashboard/form/WallpaperPreview.vue';
import WallpaperSettings from '@/dashboard/form/WallpaperSettings.vue';
import WallpaperPermissions from '@/dashboard/form/WallpaperPermissions.vue';
import WallpaperQueryParams from '@/dashboard/form/WallpaperQueryParams.vue';

const wallpaper = computed<Wallpaper | null>(() => store.currentImporting);

const wallpaperJSON = ref<JSONResponse | null>(null);

const label = ref(wallpaper.value ? getFileName(wallpaper.value.path, 'path', 30) : '');

watch(label, () => (label.value = getFileName(label.value, 'nameOnly', 30, false)));

watch(wallpaper, async () => {
	setSettings({ taskbar: false, settings: {} });
	setPermissions([]);
	setQueryParams([]);

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

const settings = ref<{ taskbar: boolean; settings: { [key: string]: string | number | boolean } }>({
	taskbar: false,
	settings: {},
});

const permissions = ref<{ type: 'executable' | 'url' | 'folder'; name: string; label: string; value: string }[]>([]);

const queryParams = ref<{ key: string; value: string }[]>([]);

const setSettings = (data: { taskbar: boolean; settings: { [key: string]: string | number | boolean } }) =>
	(settings.value = data);

const setPermissions = (
	data: { type: 'executable' | 'url' | 'folder'; name: string; label: string; value: string }[]
) => (permissions.value = data);

const setQueryParams = (data: { key: string; value: string }[]) => (queryParams.value = data);

const save = () => {
	label.value = getFileName(label.value, 'nameOnly', 30);
	const permissionsOptions = permissions.value.map((opt) => {
		opt.value = opt.value.trim();
		if (opt.value.startsWith('"')) opt.value = opt.value.slice(1);
		if (opt.value.endsWith('"')) opt.value = opt.value.slice(0, -1);
		return { name: opt.name, type: opt.type, value: opt.value };
	});
	console.log(label.value);
	console.log(settings.value.taskbar);
	console.log({ ...settings.value.settings });
	console.log([...permissionsOptions]);
	console.log([...queryParams.value]);
};

defineExpose({ save });
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
