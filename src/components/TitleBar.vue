<template>
	<div class="titlebar">
		<div class="titlebar-left">
			<img src="/imgs/logo.png" alt="" class="app-logo" />
			<span class="app-title">Nova Wallpaper</span>
		</div>
		<div class="titlebar-right">
			<button class="titlebar-btn" @click="minimizeWindow">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M7.5 13H16.5"
						stroke="currentColor"
						stroke-width="0.7"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			<button class="titlebar-btn close" @click="closeWindow">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M18 9L9 18"
						stroke="currentColor"
						stroke-width="0.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M9 9L18 18"
						stroke="currentColor"
						stroke-width="0.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NovaWallpaper } from '@/global/preload';

export default defineComponent({
	name: 'TitleBarComponent',
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
