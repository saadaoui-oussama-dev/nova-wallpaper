<template>
	<div class="header">
		<h1>Dashboard</h1>

		<button class="settings-icon" @click="settingsVisible = true">
			<icon-settings />
		</button>
		<settings-modal :visible="settingsVisible" @close="settingsVisible = false" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import SettingsModal from '@/dashboard/components/SettingsModal.vue';
import IconSettings from '@/dashboard/icons/IconSettings.vue';

const settingsVisible = ref(false);
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

.settings-icon {
	background: transparent;
	border: none;
	color: var(--text-color);
	font-size: 14px;
	width: 24px;
	height: 32px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
