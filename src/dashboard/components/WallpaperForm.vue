<template>
	<div class="wallpaper-form" v-if="store.currentImporting">
		<div class="left-side">
			<p class="title">Preview:</p>
			<div class="preview">
				<wallpaper-render :wallpaper="store.currentImporting" :settings="previewStyleVariables" :volume="volume" />
			</div>
		</div>
		<div class="right-side">
			<p class="title">Settings:</p>
			<div class="settings">
				<settings-option
					v-for="(setting, index) in properties.settings"
					:key="setting.name"
					:direction="directionText"
					v-model="properties.settings[index]"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import WallpaperRender from '@/dashboard/components/WallpaperRender.vue';
import SettingsOption from '@/dashboard/components/SettingOption.vue';
import { Settings, imageSettings, videoSettings } from '@/global/settings';

import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

const cloneSettings = (settings: Settings) => ({ direction: settings.direction, settings: [...settings.settings] });

const properties = ref(cloneSettings(imageSettings));

watch(
	() => store.currentImporting,
	(wallpaper) => {
		console.log(wallpaper);
		if (!wallpaper || wallpaper.type === 'image') properties.value = cloneSettings(imageSettings);
		else if (wallpaper.type === 'video') properties.value = cloneSettings(videoSettings);
		else properties.value = cloneSettings({ direction: 'row', settings: [] });
	}
);

const previewStyleVariables = computed(() => {
	if (['image', 'video'].includes(store.currentImporting ? store.currentImporting.type : ''))
		return Object.entries(computedSettings.value)
			.map(([key, value]) => (key === 'flip' ? `--flip: ${value ? 180 : 0}` : `--${key}: ${value}`))
			.join('; ');
	return '';
});

const directionText = computed(() => {
	if (`${properties.value.direction}`.toLowerCase() === 'column') return 'column';
	if (`${properties.value.direction}`.toLowerCase() === 'column-right') return 'column-right';
	else if (['row-right', 'right'].includes(`${properties.value.direction}`.toLowerCase())) return 'row-right';
	else return 'row';
});

const computedSettings = computed(() =>
	Object.fromEntries(properties.value.settings.map((opt) => [opt.name, opt.value]))
);

const volume = computed(() => (store.currentImporting ? (computedSettings.value.volume as number) || 0 : 0));
</script>

<style scoped>
.wallpaper-form {
	display: flex;
	height: 100%;
}

.wallpaper-form > .left-side {
	padding: 0 10px 0 20px;
}

.wallpaper-form > .right-side {
	flex: 1;
	padding: 0 20px 0 10px;
}

.title {
	font-size: 18px;
	margin-bottom: 15px;
}

.preview {
	width: 100%;
	margin-inline: auto;
	border: 1px solid var(--window-border);
}

.settings {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.reset-button {
	padding: 10px 15px;
	background-color: var(--neutral-color);
	color: var(--text-color);
	border: 1px solid var(--window-border);
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.3s ease;
}
</style>
