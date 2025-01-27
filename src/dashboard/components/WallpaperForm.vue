<template>
	<div class="wallpaper-form" v-if="wallpaper">
		<div class="section">
			<p class="title">
				Preview: <span class="suffix">({{ dimensions.width }} * {{ dimensions.height }})</span>
			</p>
			<div class="column">
				<div :class="`preview ${taskbarOption.value ? 'behind-taskbar' : ''}`" ref="preview-container">
					<wallpaper-preview :wallpaper="wallpaper" :settings="previewStyles" :volume="volume" />
				</div>
			</div>
		</div>

		<div class="section">
			<p class="title">Name:</p>
			<div class="column">
				<input v-model="label" placeholder="Wallpaper Label" maxlength="30" />
			</div>
		</div>

		<div class="section">
			<p class="title">Settings:</p>
			<div class="settings column">
				<settings-option direction="row" v-model="taskbarOption" />
				<template v-if="properties">
					<settings-option
						v-for="(setting, index) in properties.settings"
						:key="index"
						:direction="directionText"
						v-model="properties.settings[index]"
					/>
				</template>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { getFileName, replaceFileName } from '@/global/utils';
import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

import { OptionType, Settings, ToggleOption, imageSettings, videoSettings } from '@/global/settings';
import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';
import SettingsOption from '@/dashboard/components/SettingOption.vue';

const wallpaper = computed(() => store.currentImporting);

const label = ref(wallpaper.value ? getFileName(wallpaper.value.path, 'path', 30) : '');

watch(label, () => {
	label.value = getFileName(label.value, 'nameOnly', 30, false);
});

const preview = useTemplateRef('preview-container');

const dimensions = ref({ width: 1090, height: 1080 });

const taskbarOption = ref<ToggleOption>({
	label: 'Show behind taskbar',
	type: 'checkbox',
	name: 'taskbar',
	value: false,
});

const areaType = computed(() => (taskbarOption.value.value ? 'fullscreen' : 'workarea'));

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

const properties = ref<Settings | null>(null);

watch(wallpaper, async () => {
	setDimensions();
	taskbarOption.value.value = false;
	label.value = wallpaper.value ? getFileName(wallpaper.value.path, 'path', 30) || '' : '';
	if (!wallpaper.value) properties.value = null;
	else if (wallpaper.value.type === 'image') properties.value = cloneSettings(imageSettings);
	else if (wallpaper.value.type === 'video') properties.value = cloneSettings(videoSettings);
	else if (wallpaper.value.type === 'webpage') {
		const filename = replaceFileName(wallpaper.value.path, { name: 'settings', extension: 'json' });
		const response = await NovaWallpaper.json.invoke('read', filename);
		if (response.valid && Array.isArray(response.data.settings)) {
			const settings = response.data.settings.map((opt: OptionType) => {
				if (typeof opt.type !== 'string' || typeof opt.name !== 'string' || typeof opt.label !== 'string') return;
				if (opt.type.toLocaleLowerCase().trim() === 'checkbox') {
					opt.type = 'checkbox';
					opt.value = Boolean(opt.value);
				} else if (opt.type.toLocaleLowerCase().trim() === 'slider') {
					opt.type = 'slider';
					if (opt.type !== 'slider') return;
					opt.min = Number(opt.min) || 0;
					opt.max = Number(opt.max) || 100;
					opt.step = Number(opt.step) || 1;
					opt.max = opt.max <= opt.min ? opt.min + opt.step : opt.max;
					opt.value = Number(opt.value) || opt.min;
					if (opt.value > opt.max) opt.value = opt.max;
					if (opt.value < opt.min) opt.value = opt.min;
				} else if (opt.type.toLocaleLowerCase().trim() === 'radio') {
					opt.type = 'radio';
					if (opt.type !== 'radio') return;
					let valueExist = false;
					if (!Array.isArray(opt.options) || !opt.options.length) return;
					const options = opt.options.map((option) => {
						if (typeof option.label !== 'string') return;
						if (typeof option.value !== 'string' && typeof option.value !== 'number') return;
						if (option.value === opt.value) valueExist = true;
						return { value: option.value, label: option.label };
					});
					opt.options = options.filter(Boolean) as { value: string; label: string }[];
					if (!valueExist) opt.value = opt.options[0].value;
				} else return;
				return opt;
			});
			properties.value = { direction: response.data.direction, settings: settings.filter(Boolean) };
		}
	} else properties.value = null;
});

const previewStyles = computed(() => {
	if (['image', 'video'].includes(wallpaper.value ? wallpaper.value.type : ''))
		return Object.entries(computedSettings.value)
			.map(([key, value]) => (key === 'flip' ? `--flip: ${value ? 180 : 0}` : `--${key}: ${value}`))
			.join('; ');
	return '';
});

const directionText = computed(() => {
	if (!properties.value) return 'row';
	if (`${properties.value.direction}`.toLowerCase() === 'column') return 'column';
	if (`${properties.value.direction}`.toLowerCase() === 'column-right') return 'column-right';
	else if (['row-right', 'right'].includes(`${properties.value.direction}`.toLowerCase())) return 'row-right';
	else return 'row';
});

const computedSettings = computed(() => {
	if (!properties.value) return {};
	return Object.fromEntries(properties.value.settings.map((opt) => [opt.name, opt.value]));
});

const volume = computed(() => (wallpaper.value ? (computedSettings.value.volume as number) || 0 : 0));
</script>

<style scoped>
.section {
	margin-bottom: 18px;
}

.section:last-child {
	margin-bottom: 0px;
}

.title {
	font-size: 17px;
	font-weight: 700;
	margin-bottom: 11px;
}

.suffix {
	font-size: 14px;
	font-weight: 400;
	opacity: 0.7;
}

.column {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

input {
	width: 100%;
	padding: 10px;
	border-radius: 7px;
	border: 1px solid var(--window-border);
	background-color: var(--titlebar-bg);
	color: var(--text-color);
}

.preview {
	width: fit-content;
	margin-inline: auto;
	border: 1px solid var(--window-border);
}

.query-param-row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.title-bar {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 10px;
}

.title-bar > .title {
	margin-bottom: 0px;
}

.icon-btn {
	border-radius: 7px;
	background: transparent;
	border: none;
	background-color: var(--neutral-color);
	color: var(--text-color);
	height: 32px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.3s ease;
	-webkit-app-region: no-drag;
}

.icon-btn:not(.remove) {
	padding: 0px 16px 0px 10px;
}

.icon-btn:not(.remove) > svg {
	margin-right: 6px;
}

.icon-btn:not(.disabled):hover {
	background-color: var(--neutral-color-active);
}

.icon-btn.remove.disabled {
	width: 42px;
	pointer-events: none;
}

.icon-btn.remove:not(.disabled) {
	width: 42px;
	background-color: var(--danger-color);
}

.icon-btn.remove:not(.disabled):hover {
	background-color: var(--danger-color-hover);
}
</style>
