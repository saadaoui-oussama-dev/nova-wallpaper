<template>
	<div class="wallpaper-form" v-if="wallpaper">
		<wallpaper-preview :wallpaper="wallpaper" :settings="settings" :muted="false" />
		<div class="section">
			<p class="title">Name:</p>
			<div class="column">
				<input v-model="label" placeholder="Wallpaper Label" maxlength="25" />
			</div>
		</div>
		<wallpaper-settings :wallpaper="wallpaper" :json="wallpaperJSON" @change="setSettings" />
		<template v-if="wallpaper.type === 'webpage'">
			<wallpaper-permissions :wallpaper="wallpaper" :json="wallpaperJSON" @change="setPermissions" />
			<wallpaper-query-params :wallpaper="wallpaper" :json="wallpaperJSON" @change="setQueryParams" />
		</template>
	</div>
	<div v-else></div>
</template>

<script lang="ts" setup>
import { ref, watch, defineExpose } from 'vue';
import { useWallpaperStore, Wallpaper, Settings, Permission, Query } from '@/dashboard/store';
import { getFileName } from '@/global/utils';
import { JSONResponse } from '@/dashboard/channels';

import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';
import WallpaperSettings from '@/dashboard/form/WallpaperSettings.vue';
import WallpaperPermissions from '@/dashboard/form/WallpaperPermissions.vue';
import WallpaperQueryParams from '@/dashboard/form/WallpaperQueryParams.vue';

const store = useWallpaperStore();

const wallpaperJSON = ref<JSONResponse | null>(null);

const wallpaper = ref<Wallpaper | null>(null);

const label = ref(wallpaper.value ? getFileName(wallpaper.value.path, 'path', 25) : '');

watch(label, () => (label.value = getFileName(label.value, 'name', 25, false)));

watch(
	() => store.formWallpaper,
	async () => {
		wallpaper.value = store.formWallpaper;
		setSettings({ taskbar: false, settings: {} });
		setPermissions([]);
		setQueryParams([]);

		if (!wallpaper.value) {
			wallpaperJSON.value = null;
			label.value = '';
		} else {
			label.value = wallpaper.value.label || getFileName(wallpaper.value.path, 'path', 25) || '';
			wallpaperJSON.value = await store.fetchJSON(wallpaper.value, true);
			if (wallpaperJSON.value.valid && !wallpaper.value.label) {
				const { name, label: lbl } = wallpaperJSON.value.data;
				label.value = getFileName(lbl, 'name', 25) || getFileName(name, 'name', 25) || label.value;
			}
		}
	}
);

const settings = ref<{ taskbar: boolean; settings: Settings }>({ taskbar: false, settings: {} });

const permissions = ref<Permission[]>([]);

const queryParams = ref<Query[]>([]);

const setSettings = (data: { taskbar: boolean; settings: Settings }) => (settings.value = data);

const setPermissions = (data: Permission[]) => (permissions.value = data);

const setQueryParams = (data: Query[]) => (queryParams.value = data);

const saving = ref<boolean>(false);

const save = async () => {
	if (saving.value || !wallpaper.value) return;
	saving.value = true;
	label.value = getFileName(label.value, 'name', 25);
	await store.addWallpaper({
		...wallpaper.value,
		label: label.value,
		taskbar: settings.value.taskbar,
		settings: { ...settings.value.settings },
		queryParams: queryParams.value.map((opt) => ({ id: opt.id, value: opt.value })),
		permissions: permissions.value.map((opt) => {
			opt.value = opt.value.trim();
			if (opt.value.startsWith('"')) opt.value = opt.value.slice(1).trim();
			if (opt.value.endsWith('"')) opt.value = opt.value.slice(0, -1).trim();
			return { ...opt };
		}),
		content: [],
	});
	saving.value = false;
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
