<template>
	<div class="section">
		<p class="title">
			Preview: <span class="suffix">({{ dimensions.width }} * {{ dimensions.height }})</span>
		</p>
		<div class="column">
			<div :class="`preview ${settings && settings.taskbar ? 'behind-taskbar' : ''}`" ref="preview-container">
				<wallpaper-preview
					:wallpaper="wallpaper"
					:settings="previewStyles"
					:volume="Number(volume)"
					:preview="webpagePreviewURL"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { JSONResponse } from '@/global/channel-types';
import { Wallpaper } from '@/store';

const props = defineProps<{
	wallpaper: Wallpaper;
	json: JSONResponse | null;
	settings: { taskbar: boolean; settings: { [key: string]: string | number | boolean } };
}>();

const preview = useTemplateRef('preview-container');

const dimensions = ref({ width: 1090, height: 1080 });
const webpagePreviewURL = ref<string>('');

const areaType = computed(() => (props.settings.taskbar ? 'fullscreen' : 'workarea'));

const setDimensions = async () => {
	try {
		if (preview.value === null) return;
		const response = await NovaWallpaper.window.invoke('get-areas');
		preview.value.style.setProperty('--screen-width', `${response.fullscreen.width}`);
		preview.value.style.setProperty('--screen-height', `${response.fullscreen.height}`);
		preview.value.style.setProperty('--taskbar-width', `${response.taskbar.width}`);
		preview.value.style.setProperty('--taskbar-height', `${response.taskbar.height}`);
		preview.value.style.setProperty('--area-width', `${response[areaType.value].width}`);
		preview.value.style.setProperty('--area-height', `${response[areaType.value].height}`);
		dimensions.value.width = response[areaType.value].width;
		dimensions.value.height = response[areaType.value].height;
	} catch {
		console.log();
	}
};

onMounted(setDimensions);
watch(preview, setDimensions);
watch(areaType, setDimensions);

watch(
	() => props.json,
	() => {
		if (props.wallpaper.type !== 'webpage') return;
		if (!props.json || !props.json.data || typeof props.json.data.preview !== 'string')
			return (webpagePreviewURL.value = 'watcher-stimulation');
		webpagePreviewURL.value = props.json.data.preview;
	}
);

const volume = computed(() => (props.wallpaper.type === 'video' ? props.settings.settings.volume || 0 : 0));

const previewStyles = computed(() => {
	if (!['image', 'video'].includes(props.wallpaper.type)) return '';
	return Object.entries(props.settings.settings)
		.map(([key, value]) => (key === 'flip' ? `--flip: ${value ? 180 : 0}` : `--${key}: ${value}`))
		.join('; ');
});
</script>

<style scoped>
.preview {
	width: fit-content;
	margin-inline: auto;
	border: 1px solid var(--window-border);
}
</style>
