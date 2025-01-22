<template>
	<div class="header">
		<h1>Dashboard</h1>

		<div class="right-side">
			<button v-if="store.wallpapers.length" @click="toggleWallpapersAddSection">
				<icon-add-close ref="addIcon" />
			</button>

			<button class="settings-icon" @click="settingsVisible = true">
				<icon-settings />
			</button>
		</div>

		<settings-modal :visible="settingsVisible" @close="settingsVisible = false" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import eventsBus from '@/global/events';

import SettingsModal from '@/dashboard/components/SettingsModal.vue';
import IconSettings from '@/dashboard/icons/IconSettings.vue';
import IconAddClose from '@/dashboard/icons/IconAddClose.vue';

import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

const addIcon = ref<any>(null);
const settingsVisible = ref(false);

const toggleWallpapersAddSection = () => {
	const state = (addIcon.value?.toggleIcon() as 'plus' | 'close') || '';
	if (!state) return;
	if (!store.wallpapers.length && state === 'plus') return addIcon.value?.toggleIcon();
	eventsBus.$emit('icon-add-toggle', state);
};
</script>

<style scoped>
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 15px 20px 20px;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--window-border);
}

.right-side {
	display: flex;
	gap: 10px;
}

.right-side > * {
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
</style>
