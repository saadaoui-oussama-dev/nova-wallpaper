<template>
	<div class="titlebar">
		<div class="titlebar-left">
			<img src="/imgs/logo.png" alt="" class="app-logo" />
			<span class="app-title">Nova Wallpaper</span>
		</div>
		<div class="titlebar-right">
			<button class="titlebar-btn" @click="minimizeWindow">
				<icon-minimize />
			</button>

			<button class="titlebar-btn close" @click="closeWindow">
				<icon-close />
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NovaWallpaper } from '@/global/preload';

import IconClose from './icons/IconClose.vue';
import IconMinimize from './icons/IconMinimize.vue';

export default defineComponent({
	name: 'TitleBarComponent',
	components: { IconClose, IconMinimize },
	methods: {
		minimizeWindow() {
			NovaWallpaper.dashboard.send('minimize');
		},
		closeWindow() {
			NovaWallpaper.dashboard.send('close');
		},
	},
});
</script>

<style scoped>
.titlebar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #272727;
	color: #fff;
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
	color: #fff;
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
	background-color: #ffffff33;
}

.titlebar-btn.close:hover {
	background-color: #bf2a1b;
}
</style>
