<template>
	<div class="header">
		<h1>Welcome Back</h1>

		<button class="settings-icon" @click="settingsVisible = true">
			<icon-settings />
		</button>
		<settings :visible="settingsVisible" @close="settingsVisible = false" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Settings from '@/components/Settings.vue';
import IconSettings from '@/components/icons/IconSettings.vue';

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
	padding: 10px 0px 10px 20px;
}

.settings-icon {
	background: transparent;
	border: none;
	color: var(--text-color);
	font-size: 14px;
	width: 40px;
	height: 32px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
