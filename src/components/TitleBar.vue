<template>
	<div class="titlebar">
		<div class="titlebar-left">
			<img src="/imgs/logo.png" alt="" class="app-logo" />
			<span class="app-title">Nova Wallpaper</span>
		</div>
		<div class="titlebar-right">
			<button class="titlebar-btn" @click="request('minimize')">
				<icon-minimize />
			</button>

			<button class="titlebar-btn" @click="toggleSettings">
				<icon-settings />
			</button>
			<settings :visible="settingsVisible" @close="settingsVisible = false" />

			<button class="titlebar-btn close" @click="request('close')">
				<icon-close />
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NovaWallpaper } from '@/global/preload';

import Settings from '@/components/Settings.vue';
import IconClose from '@/components/icons/IconClose.vue';
import IconMinimize from '@/components/icons/IconMinimize.vue';
import IconSettings from '@/components/icons/IconSettings.vue';

export default defineComponent({
	name: 'TitleBarComponent',
	components: { Settings, IconClose, IconMinimize, IconSettings },
	data: () => ({
		settingsVisible: false,
	}),
	methods: {
		request(action: 'minimize' | 'close') {
			NovaWallpaper.dashboard.send(action);
		},
		toggleSettings() {
			this.settingsVisible = !this.settingsVisible;
		},
	},
});
</script>

<style scoped>
.titlebar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: var(--titlebar-bg);
	color: var(--text-color);
	height: 32px;
	padding: 0 0 0 10px;
	user-select: none;
	-webkit-app-region: drag;
}

.titlebar-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.app-logo {
	height: 18px;
}

.app-title {
	font-size: 14px;
}

.titlebar-right {
	display: flex;
}

.titlebar-btn {
	background: transparent;
	border: none;
	color: var(--text-color);
	font-size: 14px;
	width: 42px;
	height: 32px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.3s ease;
	-webkit-app-region: no-drag;
}

.titlebar-btn:hover {
	background-color: var(--titlebar-btn-hover);
}

.titlebar-btn.close:hover {
	background-color: var(--titlebar-btn-danger-hover);
}
</style>
