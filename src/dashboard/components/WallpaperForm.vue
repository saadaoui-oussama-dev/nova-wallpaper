<template>
	<div class="wallpaper-form" v-if="wallpaper">
		<div class="left-side">
			<div class="section">
				<p class="title">Name:</p>
				<div class="column">
					<input v-model="label" maxlength="30" />
				</div>
			</div>

			<div class="section">
				<p class="title">
					Preview: <span class="suffix">({{ dimensions.width }} * {{ dimensions.height }})</span>
				</p>
				<div class="column">
					<div class="preview" ref="preview-container">
						<wallpaper-preview :wallpaper="wallpaper" :settings="previewStyles" :volume="volume" />
					</div>
				</div>
			</div>
		</div>

		<div class="right-side section">
			<p class="title">Settings:</p>
			<div class="column">
				<settings-option direction="row" v-model="taskbarOption" />
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

import { Settings, ToggleOption, imageSettings, videoSettings } from '@/global/settings';
import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';
import SettingsOption from '@/dashboard/components/SettingOption.vue';
import { getFileName } from '@/global/utils';

const wallpaper = computed(() => store.currentImporting);

const label = ref(wallpaper.value ? getFileName(wallpaper.value.path, 'path', 30) : '');

watch(label, () => {
	label.value = getFileName(label.value, 'nameOnly', 30, false);
});

const preview = useTemplateRef('preview-container');

const dimensions = ref({ width: 1090, height: 1080 });

const taskbarOption = ref<ToggleOption>({ label: 'Exclude Taskbar', type: 'checkbox', name: 'taskbar', value: true });

const areaType = computed(() => (taskbarOption.value.value ? 'workarea' : 'fullscreen'));

const setDimensions = async () => {
	try {
		if (preview.value === null) return;
		const response = await NovaWallpaper.window.invoke('get-areas');
		preview.value.style.setProperty('--screen-width', `${response.fullscreen.width}`);
		preview.value.style.setProperty('--screen-height', `${response.fullscreen.height}`);
		preview.value.style.setProperty('--taskbar-width', `${response.taskbar.width}`);
		preview.value.style.setProperty('--taskbar-height', `${response.taskbar.height}`);
		preview.value.style.setProperty('--area-width', `${response[areaType.value].width}`);
		preview.value.style.setProperty('--area-height', `${response[areaType.value].height}`);
		dimensions.value.width = response[areaType.value].width;
		dimensions.value.height = response[areaType.value].height;
	} catch {
		console.log();
	}
};

watch(preview, setDimensions);

watch(areaType, setDimensions);

const cloneSettings = (settings: Settings) => ({ direction: settings.direction, settings: [...settings.settings] });

const properties = ref(cloneSettings(imageSettings));

watch(wallpaper, async () => {
	setDimensions();
	taskbarOption.value.value = true;
	label.value = wallpaper.value ? getFileName(wallpaper.value.path, 'path', 30) || '' : '';
	if (!wallpaper.value || wallpaper.value.type === 'image') properties.value = cloneSettings(imageSettings);
	else if (wallpaper.value.type === 'video') properties.value = cloneSettings(videoSettings);
	else properties.value = cloneSettings({ direction: 'row', settings: [] });
});

const previewStyles = computed(() => {
	if (['image', 'video'].includes(wallpaper.value ? wallpaper.value.type : ''))
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

const volume = computed(() => (wallpaper.value ? (computedSettings.value.volume as number) || 0 : 0));
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

.section {
	margin-bottom: 18px;
}

.section:last-child {
	margin-bottom: 0px;
}

.title {
	font-size: 18px;
	margin-bottom: 11px;
}

.column {
	display: flex;
	flex-direction: column;
	gap: 11px;
}

input {
	width: 100%;
	padding: 10px;
	border-radius: 7px;
	border: 1px solid var(--window-border);
	background-color: var(--titlebar-bg);
	color: var(--text-color);
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
</style>
