<template>
	<div class="wallpaper-form" v-if="wallpaper">
		<div class="section">
			<p class="title">Name:</p>
			<div class="column">
				<input v-model="label" placeholder="Wallpaper Name" maxlength="25" />
			</div>
		</div>
		<wallpaper-preview :wallpaper="wallpaper" :settings="settings" />
		<wallpaper-settings :wallpaper="wallpaper" :json="wallpaperJSON" @change="setSettings" />
		<template v-if="wallpaper.path.endsWith('.html')">
			<wallpaper-queries :wallpaper="wallpaper" :json="wallpaperJSON" @change="setQueries" />
		</template>
	</div>
	<div v-else></div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { NovaWallpaper } from '@/electron-vue/preload';
import { useWallpaperStore } from '@/global/store';
import { getFileName } from '@/global/files';
import { useDialog } from '@/global/dialog';
import { Wallpaper, SimpleMap } from '@/types/wallpaper';
import { Response, JSONChannel } from '@/types/channels';
import WallpaperPreview from '@/global/WallpaperPreview.vue';
import WallpaperSettings from '@/form/components/WallpaperSettings.vue';
import WallpaperQueries from '@/form/components/WallpaperQueries.vue';

const store = useWallpaperStore();

const wallpaperJSON = ref<Response<JSONChannel> | null>(null);

const wallpaper = ref<Wallpaper | null>(null);

const label = ref('');

const settings = ref<{ taskbar: boolean; settings: SimpleMap }>({ taskbar: false, settings: {} });

const queries = ref<SimpleMap>({});

watch(
	() => store.formWallpaper,
	async () => {
		wallpaper.value = store.formWallpaper;

		if (!wallpaper.value) {
			wallpaperJSON.value = null;
			label.value = '';
			setSettings({ taskbar: false, settings: {} });
			setQueries({});
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

watch(label, () => {
	if (!wallpaper.value) return;
	label.value = getFileName(label.value, 'name', 25, false);
	store.updateWallpaper({
		id: wallpaper.value.id,
		label: getFileName(label.value, 'name', 25),
	});
});

const setSettings = (data: { taskbar: boolean; settings: SimpleMap }) => {
	settings.value = data;
	if (!wallpaper.value) return;
	store.updateWallpaper({
		id: wallpaper.value.id,
		taskbar: settings.value.taskbar,
		settings: { ...settings.value.settings },
	});
};

const setQueries = (data: SimpleMap) => {
	queries.value = data;
	if (!wallpaper.value) return;
	store.updateWallpaper({
		id: wallpaper.value.id,
		queries: { ...queries.value },
	});
};

const remove = async () => {
	if (!wallpaper.value) return;
	const response = await useDialog('Are you sure you want to delete this wallpaper?', {
		neutralBtn: 'Cancel',
		primaryBtn: { text: 'Delete', danger: true },
		styles: {
			modal: { minWidth: '290px' },
		},
	});
	if (!response) return;
	const valid = await store.deleteWallpaper(wallpaper.value, 'form');
	if (valid) store.formWallpaper = null;
};

const finish = async () => {
	if (!wallpaper.value) return;
	label.value = getFileName(label.value, 'name', 25);
	const valid = await store.updateWallpaper({
		id: wallpaper.value.id,
		label: label.value,
		taskbar: settings.value.taskbar,
		settings: { ...settings.value.settings },
		queries: { ...queries.value },
	});
	if (!valid) return;
	NovaWallpaper.window.send('close-form');
};

// eslint-disable-next-line
defineExpose({ remove, finish });
</script>

<style>
.wallpaper-form {
	--width: 299;
}

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
