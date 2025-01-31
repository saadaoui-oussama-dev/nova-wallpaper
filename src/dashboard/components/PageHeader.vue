<template>
	<div class="header">
		<h1>{{ store.currentImporting ? 'Parameters' : 'Add Wallpapers' }}</h1>

		<div class="right-side">
			<template v-if="store.currentImporting">
				<button class="text-btn" @click="store.cancelImporting">Discard</button>
				<button class="text-btn primary" @click="emit('save')">Save</button>
			</template>

			<button v-else class="settings-icon" @click="settingsVisible = true">
				<icon-settings />
			</button>
		</div>

		<settings-modal :visible="settingsVisible" @close="settingsVisible = false" />
	</div>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue';
import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

import SettingsModal from '@/dashboard/components/SettingsModal.vue';
import IconSettings from '@/dashboard/icons/IconSettings.vue';

const emit = defineEmits(['save']);

const settingsVisible = ref(false);
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
