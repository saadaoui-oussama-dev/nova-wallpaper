<template>
	<div class="render text" v-if="error">
		<p v-html="error"></p>
	</div>
	<div class="render text" v-else-if="!url">
		<p>Loading...</p>
	</div>
	<div :class="`render ${rotateVertical ? 'rotate-vertical' : ''}`" v-else>
		<video
			v-if="isVideo"
			ref="video"
			class="content"
			:style="settings"
			:src="url"
			:muted="wallpaper.type !== 'video'"
			autoplay
			loop
			playsinline
		></video>
		<img v-else class="content" :src="url" :style="settings" />
		<div class="taskbar"></div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, ref, useTemplateRef, onMounted, computed, watch } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { Wallpaper } from '@/store';
import { replaceFileName } from '@/global/utils';
import { FilesResponse } from '@/global/channel-types';

const props = defineProps<{ wallpaper: Wallpaper; settings: string; volume: number }>();

const url = ref('');
const error = ref('');
const isVideo = ref(false);

const video = useTemplateRef('video');
const setVolume = () => props.wallpaper.type === 'video' && video.value && (video.value.volume = props.volume / 100);
onMounted(setVolume);
watch(video, setVolume);
watch(() => props.volume, setVolume);

onMounted(async () => {
	try {
		let data: FilesResponse = { path: '', error: '' };
		if (props.wallpaper.type !== 'webpage') {
			data = await NovaWallpaper.files.invoke('get-url', props.wallpaper.path);
		} else {
			const preview = ['png', 'jpg', 'jpeg', 'gif', 'mp4'];
			let cursor = 0;
			while (!data.error && !data.path && cursor < preview.length) {
				const path = replaceFileName(props.wallpaper.path, { name: 'preview', extension: preview[cursor] });
				const response = await NovaWallpaper.files.invoke('get-url', path);
				if (response.path) data.path = response.path;
				else if (response.error?.includes('limit')) data.error = `The wallpaper preview<br />exceeds the 40MB limit.`;
				else cursor++;
			}
			if (cursor === preview.length)
				data.error =
					'<p>Webpages can only be<br />rendered, not previewed.</p><p style="margin-top: 5px; opacity: 0.5">You can include a preview.png file alongside the HTML file.</p>';
		}
		if (data.error) error.value = data.error;
		else if (data.path) url.value = data.path;
		isVideo.value = url.value.startsWith('data:video') || url.value.endsWith('.mp4');
	} catch (e) {
		url.value = '';
	}
});

const rotateVertical = computed(
	() => props.settings.includes('--rotate: 90') || props.settings.includes('--rotate: -90')
);
</script>

<style scoped>
.render {
	--width: 251.33;
	overflow: hidden;
	position: relative;
	width: calc(var(--width) * 1px);
	aspect-ratio: var(--screen-width, 1920) / var(--screen-height, 1080);
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
	position: absolute;
	top: 50%;
	left: 50%;
	width: calc(var(--width) * 1px);
	height: calc(var(--width) * var(--area-height, 1033) * 1px / var(--area-width, 1920));
	display: block;
	object-fit: cover;
	transform: translate(
			-50%,
			calc(
				-50% - (var(--screen-height, 1080) - var(--area-height, 1033)) * var(--width) * 0.5px / var(--screen-width, 1920)
			)
		)
		rotateY(calc(var(--flip, 0) * 1deg)) rotateZ(calc(var(--rotate, 0) * 1deg));
	filter: saturate(calc(var(--saturate) * 0.01)) contrast(calc(var(--contrast) * 1%))
		brightness(calc(var(--brightness) * 1%)) hue-rotate(calc(var(--hue-rotate) * 1deg));
}

img.content {
	image-rendering: -webkit-optimize-contrast;
}

.rotate-vertical .content {
	height: calc(var(--width) * 1px);
	width: calc(var(--width) * var(--area-height, 1033) * 1px / var(--area-width, 1920));
}

.taskbar {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: calc((var(--taskbar-height, 47)) * var(--width) * 1px / var(--screen-width, 1920));
	background-color: var(--window-border);
}
</style>
