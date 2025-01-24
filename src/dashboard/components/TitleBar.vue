<template>
	<div class="titlebar">
		<div class="titlebar-left">
			<img src="/imgs/logo.png" alt="" class="app-logo" />
			<span class="app-title">Nova Wallpaper</span>
		</div>
		<div class="titlebar-right">
			<button class="titlebar-btn" @click="NovaWallpaper.window.send('minimize')">
				<icon-minimize />
			</button>

			<button class="titlebar-btn close" @click="NovaWallpaper.window.send('close')">
				<icon-close />
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { NovaWallpaper } from '@/dashboard/preload';
import IconClose from '@/dashboard/icons/IconClose.vue';
import IconMinimize from '@/dashboard/icons/IconMinimize.vue';
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
