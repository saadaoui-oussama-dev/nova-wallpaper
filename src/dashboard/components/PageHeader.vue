<template>
	<div class="header">
		<h1>{{ store.currentImporting ? 'Parameters' : 'Add Wallpapers' }}</h1>

		<div class="right-side">
			<button v-show="!store.currentImporting && store.wallpapers.length" @click="toggleWallpapersAddSection">
				<icon-add ref="addIcon" />
			</button>

			<template v-if="store.currentImporting">
				<button class="text-btn" @click="store.cancelImporting">Cancel</button>
				<button class="text-btn primary">Save</button>
			</template>

			<button v-else class="settings-icon" @click="settingsVisible = true">
				<icon-settings />
			</button>
		</div>

		<settings-modal :visible="settingsVisible" @close="settingsVisible = false" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { events } from '@/global/utils';
import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

import SettingsModal from '@/dashboard/components/SettingsModal.vue';
import IconSettings from '@/dashboard/icons/IconSettings.vue';
import IconAdd from '@/dashboard/icons/IconAdd.vue';

const addIcon = ref<any>(null);
const settingsVisible = ref(false);

const toggleWallpapersAddSection = () => {
	const state = (addIcon.value?.toggleIcon() as 'plus' | 'close') || '';
	if (!state) return;
	if (!store.wallpapers.length && state === 'plus') return addIcon.value?.toggleIcon();
	events.$emit('icon-add-toggle', state);
};
</script>

<style scoped>
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 15px 20px;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--window-border);
}

.right-side {
	display: flex;
	gap: 10px;
}

.right-side > :not(.text-btn) {
	background: transparent;
	border: none;
	color: var(--text-color);
	width: 32px;
	height: 32px;
	font-size: 14px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

.settings-icon {
	width: 24px;
}

.text-btn {
	color: var(--text-color);
	background-color: var(--neutral-color);
	border: none;
	border-radius: 7px;
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	padding: 8px 20px;
	transition: background-color 0.15s ease-in-out;
}

.text-btn:hover {
	background-color: var(--neutral-color-active);
}

.primary {
	background-color: var(--primary-color);
}

.primary:hover {
	background-color: var(--primary-color-active);
}
</style>
