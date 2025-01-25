<template>
	<div class="wallpaper-form" v-if="store.currentImporting">
		<div class="left-side">
			<p class="title">
				Preview: <span class="suffix">({{ dimensions.width }} * {{ dimensions.height }})</span>
			</p>
			<div class="preview" ref="preview-container">
				<wallpaper-preview :wallpaper="store.currentImporting" :settings="previewStyles" :volume="volume" />
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
import { computed, ref, useTemplateRef, watch } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

import { Settings, imageSettings, videoSettings } from '@/global/settings';
import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';
import SettingsOption from '@/dashboard/components/SettingOption.vue';

const preview = useTemplateRef('preview-container');

const cloneSettings = (settings: Settings) => ({ direction: settings.direction, settings: [...settings.settings] });

const properties = ref(cloneSettings(imageSettings));
const dimensions = ref({ width: 1090, height: 1080 });

const setDimensions = async () => {
	if (!preview.value) return;
	try {
		const { fullscreen } = await NovaWallpaper.window.invoke('get-areas');
		preview.value.style.setProperty('--screen-width', `${fullscreen.width}`);
		preview.value.style.setProperty('--screen-height', `${fullscreen.height}`);
		dimensions.value.width = fullscreen.width;
		dimensions.value.height = fullscreen.height;
	} catch {}
};

watch(preview, setDimensions);
watch(
	() => store.currentImporting,
	async (wallpaper) => {
		setDimensions();
		if (!wallpaper || wallpaper.type === 'image') properties.value = cloneSettings(imageSettings);
		else if (wallpaper.type === 'video') properties.value = cloneSettings(videoSettings);
		else properties.value = cloneSettings({ direction: 'row', settings: [] });
	}
);

const previewStyles = computed(() => {
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

.suffix {
	font-size: 16px;
	opacity: 0.7;
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
