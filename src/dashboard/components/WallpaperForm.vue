<template>
	<div class="wallpaper-form" v-if="store.currentImporting">
		<div class="left-side">
			<p class="title">Preview:</p>
			<div class="preview">
				<wallpaper-render :wallpaper="store.currentImporting" :settings="computedSettings" />
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
				<p>{{ computedSettings }}</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import WallpaperRender from '@/dashboard/components/WallpaperRender.vue';
import SettingsOption from '@/dashboard/components/SettingOption.vue';
import { OptionType } from '@/global/settings-types';

import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

const properties = ref<{
	direction: 'row' | 'right' | 'row-right' | 'column' | 'column-right';
	settings: OptionType[];
}>({
	direction: 'row',
	settings: [
		{
			label: 'Flip Image (Mirror)',
			type: 'checkbox',
			name: 'flip',
			value: false /* transform: rotateY(true ? 180deg : 0deg) */,
		},
		{
			label: 'Rotation',
			type: 'radio',
			name: 'rotation',
			value: 0 /* rotate: 0deg */,
			options: [
				{ label: '-90°', value: -90 },
				{ label: '0°', value: 0 },
				{ label: '90°', value: 90 },
				{ label: '180°', value: 180 },
			],
		},
		{
			label: 'Saturation',
			type: 'slider',
			name: 'saturate',
			value: 1 /* filter: saturate(1) */,
			min: 0,
			max: 10,
			step: 1,
		},
		{
			label: 'Contrast',
			type: 'slider',
			name: 'contrast',
			value: 100 /* filter: contrast(100%) */,
			min: 50,
			max: 200,
			step: 5,
		},
		{
			label: 'Brightness',
			type: 'slider',
			name: 'brightness',
			value: 100 /* filter: brightness(100%) */,
			min: 50,
			max: 200,
			step: 5,
		},
		{
			label: 'Grayscale',
			type: 'slider',
			name: 'grayscale',
			value: 0 /* filter: grayscale(0%) */,
			min: 0,
			max: 100,
			step: 1,
		},
		{
			label: 'HUE Colors Rotate',
			type: 'slider',
			name: 'hue-rotate',
			value: 0 /* filter: hue-rotate(0%) */,
			min: 0,
			max: 360,
			step: 1,
		},
		{
			label: 'Invert Colors',
			type: 'checkbox',
			name: 'invert',
			value: false /* filter: invert(true ? 100% : 0%) */,
		},
	],
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
</script>

<style scoped>
.wallpaper-form {
	display: flex;
	height: 100%;
}

.wallpaper-form > .left-side {
	width: calc(100% / 3 - 30px);
	margin: 0 10px 0 20px;
}

.wallpaper-form > .right-side {
	width: calc(200% / 3 - 30px);
	margin: 0 20px 0 10px;
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
