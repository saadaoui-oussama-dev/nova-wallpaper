<template>
	<div class="header">
		<h1>Dashboard</h1>

		<button class="settings-icon" @click="settingsVisible = true">
			<icon-settings />
		</button>
		<settings :visible="settingsVisible" @close="settingsVisible = false" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Settings from '@/dashboard/components/Settings.vue';
import IconSettings from '@/dashboard/icons/IconSettings.vue';

export default defineComponent({
	name: 'HeaderComponent',
	components: { Settings, IconSettings },
	data: () => ({
		settingsVisible: false,
	}),
});
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
