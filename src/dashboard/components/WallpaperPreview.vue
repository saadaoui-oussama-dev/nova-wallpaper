<template>
	<div class="section">
		<p class="title">
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
						:muted="wallpaper.type !== 'video'"
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
import { defineProps, defineEmits, computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { isSupported, replaceFileName } from '@/global/utils';
import { FilesResponse, JSONResponse } from '@/global/channel-types';
import { Wallpaper } from '@/store';

const emit = defineEmits(['setBase64']);

const props = defineProps<{
	wallpaper: Wallpaper;
	json?: JSONResponse | null;
	settings?: { taskbar: boolean; settings: { [key: string]: string | number | boolean } };
	muted: boolean;
}>();

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
		console.log();
	}
};

watch(container, setDimensions);

watch(areaType, setDimensions);

// Preview URL

const base64url = ref('');

const renderError = ref('');

const isVideo = ref(false);

watch(
	() => props.json,
	async () => {
		try {
			if (props.wallpaper.type === 'image' || props.wallpaper.type === 'video') {
				const data = await NovaWallpaper.files.invoke('get-url', props.wallpaper.path);
				if (data.error) renderError.value = data.error;
				else if (data.path) {
					base64url.value = data.path;
					emit('setBase64', data.path);
				}
				isVideo.value = base64url.value.startsWith('data:video') || base64url.value.endsWith('.mp4');
				return;
			}

			const data: FilesResponse = { path: '', error: '' };
			const preview = [
				['preview', 'png'],
				['preview', 'jpg'],
				['preview', 'jpeg'],
				['preview', 'mp4'],
			];
			if (props.json && props.json.data && typeof props.json.data.preview === 'string') {
				if (props.json.data.preview && isSupported(props.json.data.preview, true)) {
					const parts = props.json.data.preview.split('.');
					const filename = parts.slice(0, parts.length - 1).join('.');
					const extension = parts[parts.length - 1];
					if (filename !== 'preview') preview.unshift([filename, extension]);
				}
			}

			let cursor = 0;
			while (!data.error && !data.path && cursor < preview.length) {
				const path = replaceFileName(props.wallpaper.path, { name: preview[cursor][0], extension: preview[cursor][1] });
				const response = await NovaWallpaper.files.invoke('get-url', path);
				if (response.path) data.path = response.path;
				else if (response.error?.includes('limit')) data.error = `The wallpaper preview<br />exceeds the 40MB limit.`;
				else cursor++;
			}
			if (cursor === preview.length)
				data.error =
					'<p>Webpages can only be<br />rendered, not previewed.</p><p style="margin-top: 5px; opacity: 0.5">You can include a preview.png file<br />alongside the HTML file.</p>';
			if (data.error) renderError.value = data.error;
			else if (data.path) {
				base64url.value = data.path;
				emit('setBase64', data.path);
			}
			isVideo.value = base64url.value.startsWith('data:video') || base64url.value.endsWith('.mp4');
		} catch {
			base64url.value = '';
		}
	}
);

// Preview Options

const previewStyles = computed(() => {
	if (!['image', 'video'].includes(props.wallpaper.type)) return { styles: '', rotate: false };
	const styles = Object.entries((props.settings || props.wallpaper).settings)
		.map(([key, value]) => (key === 'flip' ? `--flip: ${value ? 180 : 0}` : `--${key}: ${value}`))
		.join('; ');
	return { styles, rotate: styles.includes('--rotate: 90') || styles.includes('--rotate: -90') };
});

const volume = computed(() => {
	if (props.muted || props.wallpaper.type !== 'video') return 0;
	return Number((props.settings || props.wallpaper).settings.volume) || 0;
});

const video = useTemplateRef('video');

const setVolume = () => props.wallpaper.type === 'video' && video.value && (video.value.volume = volume.value / 100);

onMounted(setVolume);

watch(video, setVolume);

watch(volume, setVolume);
</script>

<style scoped>
.preview {
	width: fit-content;
	margin-inline: auto;
	border: 1px solid var(--window-border);
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
	height: calc((var(--area-height, 1033) + 1) * 1px * var(--width, 300) / var(--area-width, 1920));
	display: block;
	object-fit: cover;
	transform: translate(
			-50%,
			calc(
				-50% - (var(--screen-height, 1080) - var(--area-height, 1033) - 1) * 0.5px * var(--width, 300) / var(--screen-width, 1920)
			)
		)
		rotateY(calc(var(--flip, 0) * 1deg)) rotateZ(calc(var(--rotate, 0) * 1deg));
	filter: saturate(calc(var(--saturate) * 0.01)) contrast(calc(var(--contrast) * 1%))
		brightness(calc(var(--brightness) * 1%)) hue-rotate(calc(var(--hue-rotate) * 1deg));
}

.rotate-vertical .content {
	height: calc(var(--width, 300) * 1px);
	width: calc((var(--area-height, 1033) + 1) * 1px * var(--width, 300) / var(--area-width, 1920));
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
