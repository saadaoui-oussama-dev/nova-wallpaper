<template>
	<div class="render text" v-if="error">
		<p v-html="error"></p>
	</div>
	<div class="render text" v-else-if="!url">
		<p>Loading...</p>
	</div>
	<div class="render" v-else>
		<video v-if="url.endsWith('.mp4')" class="content" :src="url" autoplay muted loop></video>
		<img v-else class="content" :src="url" />
	</div>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { Wallpaper } from '@/store';
import { replaceFileName } from '@/global/utils';

const props = defineProps<{ wallpaper: Wallpaper; settings: any }>();

const url = ref('');
const error = ref('');

onMounted(async () => {
	try {
		if (props.wallpaper.type === 'webpage') {
			const preview = ['png', 'jpg', 'jpeg', 'gif', 'mp4'];
			const data = { path: '', error: '', cursor: 0 };
			while (data.cursor < preview.length) {
				let path = replaceFileName(props.wallpaper.path, { name: 'preview', extension: preview[data.cursor] });
				const response = await NovaWallpaper.files.invoke('get-url', path);
				if (response.path) {
					data.path = response.path;
					break;
				} else if (response.error === 'File exceeds the 40MB limit.') {
					data.error = `The wallpaper preview<br />exceeds the 40MB limit.`;
					break;
				} else {
					data.cursor++;
				}
			}

			if (data.error) error.value = data.error;
			if (data.path) return (url.value = data.path);
			if (data.cursor === preview.length)
				error.value =
					'<p>Webpages can only be<br />rendered, not previewed.</p><p style="margin-top: 5px; opacity: 0.5">You can include a preview.png file alongside the HTML file.</p>';
		} else {
			const data = await NovaWallpaper.files.invoke('get-url', props.wallpaper.path);
			if (data.error) error.value = data.error;
			if (data.path) url.value = data.path;
		}
	} catch (e) {
		url.value = '';
	}
});
</script>

<style scoped>
.render {
	width: 100%;
	aspect-ratio: 1920 / 1080;
}

.render.text {
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
}

.render.text p {
	text-align: center;
	vertical-align: middle;
}

.content {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
}
</style>
