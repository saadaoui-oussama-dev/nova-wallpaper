<template>
	<div class="section">
		<p v-if="!onlyPreview" class="title">
			Preview: <span class="suffix">({{ dimensions.width }} * {{ dimensions.height }})</span>
		</p>
		<div class="column">
			<div :class="`preview ${settings && settings.taskbar ? 'behind-taskbar' : ''}`" ref="container">
				<div class="render text" v-if="renderError">
					<p v-html="renderError"></p>
				</div>
				<div class="render text" v-else-if="!base64url">
					<p>Loading...</p>
				</div>
				<div :class="`render ${previewStyles.rotate ? 'rotate-vertical' : ''}`" v-else>
					<video
						v-if="isVideo"
						ref="video"
						class="content"
						:style="previewStyles.styles"
						:src="base64url"
						muted
						autoplay
						loop
						playsinline
					></video>
					<img v-else class="content" :src="base64url" :style="previewStyles.styles" />
					<img class="taskbar" src="/img/taskbar.png" alt="" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useWallpaperStore } from '@/global/store';
import { NovaWallpaper } from '@/electron-vue/preload';
import { isSupported } from '@/global/files';
import { Wallpaper } from '@/types/wallpaper';

// eslint-disable-next-line
const props = defineProps<{
	wallpaper: Wallpaper;
	settings?: { taskbar: boolean; settings: { [key: string]: string | number | boolean } };
	onlyPreview?: boolean;
}>();

const store = useWallpaperStore();

// Preview Div Dimensions

const container = useTemplateRef('container');

const dimensions = ref({ width: 1090, height: 1080 });

const areaType = computed(() => ((props.settings || props.wallpaper).taskbar ? 'fullscreen' : 'workarea'));

const setDimensions = async () => {
	try {
		if (container.value === null) return;
		const response = await NovaWallpaper.window.invoke('get-areas');
		container.value.style.setProperty('--screen-width', `${response.fullscreen.width}`);
		container.value.style.setProperty('--screen-height', `${response.fullscreen.height}`);
		container.value.style.setProperty('--taskbar-width', `${response.taskbar.width}`);
		container.value.style.setProperty('--taskbar-height', `${response.taskbar.height}`);
		container.value.style.setProperty('--area-width', `${response[areaType.value].width}`);
		container.value.style.setProperty('--area-height', `${response[areaType.value].height}`);
		dimensions.value.width = response[areaType.value].width;
		dimensions.value.height = response[areaType.value].height;
	} catch {
		return;
	}
};

watch(container, setDimensions);

watch(areaType, setDimensions);

// Preview URL

const base64url = ref('');

const renderError = ref('');

const isVideo = ref(false);

const setURL = async () => {
	try {
		const data = await store.fetchPreview(props.wallpaper);
		if (data.error) renderError.value = data.error;
		else if (data.path) {
			base64url.value = data.path;
			isVideo.value = base64url.value.startsWith('data:video') || base64url.value.endsWith('.mp4');
		}
	} catch {
		base64url.value = '';
	}
};

onMounted(() => store.data && setURL());

watch(() => store.data, setURL);

// Preview Options

const previewStyles = computed(() => {
	if (!isSupported(props.wallpaper.path, true)) return { styles: '', rotate: false };
	const styles = Object.entries((props.settings || props.wallpaper).settings)
		.map(([key, value]) => (key === 'flip' ? `--flip: ${value ? 180 : 0}` : `--${key}: ${value}`))
		.join('; ');
	return { styles, rotate: styles.includes('--rotate: 90') || styles.includes('--rotate: -90') };
});

const video = useTemplateRef('video');

const speed = computed(() => {
	return Number((props.settings || props.wallpaper).settings.speed) || 1;
});

const setSpeed = () => props.wallpaper.path.endsWith('.mp4') && video.value && (video.value.playbackRate = speed.value);

watch(video, setSpeed);

watch(speed, setSpeed);
</script>

<style scoped>
.preview {
	width: fit-content;
	margin-inline: auto;
	border: 1px solid var(--border-color);
}

.render {
	overflow: hidden;
	position: relative;
	width: calc(var(--width, 300) * 1px);
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
	width: calc(var(--width, 300) * 1px);
	height: calc((var(--area-height, 1033) + 2) * 1px * var(--width, 300) / var(--area-width, 1920));
	display: block;
	object-fit: cover;
	transform: translate(
			-50%,
			calc(
				-50% - (var(--screen-height, 1080) - var(--area-height, 1033) - 1) * 0.5px * var(--width, 300) / var(--screen-width, 1920)
			)
		)
		rotateY(calc(var(--flip, 0) * 1deg)) rotateZ(calc(var(--rotate, 0) * 1deg));
	filter: saturate(calc(var(--saturate, 100) * 0.01)) contrast(calc(var(--contrast, 100) * 1%))
		brightness(calc(var(--brightness, 100) * 1%)) hue-rotate(calc(var(--hue-rotate, 0) * 1deg));
}

.rotate-vertical .content {
	height: calc(var(--width, 300) * 1px);
	width: calc((var(--area-height, 1033) + 2) * 1px * var(--width, 300) / var(--area-width, 1920));
}

img.content {
	image-rendering: -webkit-optimize-contrast;
}

.taskbar {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: calc((var(--taskbar-height, 47)) * 1px * var(--width, 300) / var(--screen-width, 1920));
	background-color: #e2eef9;
	object-fit: contain;
}

.behind-taskbar .taskbar {
	opacity: 0.7;
}
</style>
