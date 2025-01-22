<template>
	<div class="mask" v-show="visible" @click="$emit('close')"></div>
	<div class="settings" v-show="visible">
		<div class="option">
			<p>Text font</p>
			<div class="toggle-options">
				<label
					v-for="font in fonts"
					:key="font.value"
					class="toggle-option"
					:class="{ selected: font.value === selectedFont }"
				>
					<input type="radio" :name="font.value" :value="font.value" v-model="selectedFont" class="hidden-radio" />
					<span :class="`font-${font.value}`">{{ font.label }}</span>
				</label>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import { useWallpaperStore } from '@/store';

const store = useWallpaperStore();

const props = defineProps({
	visible: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);

const fonts = [
	{ label: 'Standard', value: 'standard' },
	{ label: 'Handwritten', value: 'handwritten' },
];
const selectedFont = ref(store.settings.font);

watch(selectedFont, (newFont) => {
	store.updateSettings({ font: newFont });
});
</script>

<style scoped>
.mask {
	position: fixed;
	top: 32px;
	left: 0;
	width: 100%;
	height: calc(100% - 32px);
	z-index: 999;
}

.settings {
	position: absolute;
	top: 42px;
	right: 10px;
	background-color: var(--titlebar-bg);
	padding: 10px;
	z-index: 1000;
}

.option p {
	margin-bottom: 5px;
}

.option:not(:last-child) {
	margin-bottom: 5px;
	padding-bottom: 5px;
	border-bottom: 1px solid var(--window-border);
}

.toggle-options {
	display: inline-flex;
	border: 1px solid var(--window-border);
	border-radius: 4px;
	overflow: hidden;
	width: 300px;
	background-color: var(--window-bg);
}

.toggle-option {
	width: 50%;
	text-align: center;
	padding: 8px 0;
	cursor: pointer;
	background-color: var(--neutral-color);
	color: var(--text-color);
	transition: background-color 0.3s, color 0.3s;
}

.toggle-option:hover {
	background-color: var(--neutral-color-active);
}

.toggle-option.selected {
	background-color: var(--primary-color);
}

.toggle-option.selected:hover {
	background-color: var(--primary-color-active);
}

.hidden-radio {
	display: none;
}
</style>
