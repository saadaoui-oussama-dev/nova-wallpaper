<template>
	<div class="wallpaper-form" v-if="store.currentImporting">
		<div class="left-side">
			<p class="title">Preview:</p>
			<div class="preview">
				<wallpaper-render :wallpaper="store.currentImporting" :settings="settings" />
			</div>
		</div>
		<div class="right-side">
			<p class="title">Settings:</p>
			<p>{{ store.currentImporting }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import WallpaperRender from './WallpaperRender.vue';

import { useWallpaperStore } from '@/store';
const store = useWallpaperStore();

const settings = ref({} as { [key: string]: any });
</script>

<style scoped>
.wallpaper-form {
	display: flex;
	height: 100%;
}

.wallpaper-form > .left-side {
	width: calc(100% / 3 - 30px);
	margin: 0 10px 0 20px;
}

.wallpaper-form > .right-side {
	width: calc(200% / 3 - 30px);
	margin: 0 20px 0 10px;
}

.title {
	font-size: 18px;
	margin-bottom: 7px;
}

.preview {
	width: 100%;
	margin-inline: auto;
	border: 1px solid var(--window-border);
}
</style>
