<template>
	<template v-if="task === 'splashscreen'">
		<splash-screen />
	</template>

	<template v-else-if="task === 'main'">
		<main-library />
	</template>

	<template v-else-if="task === 'form'">
		<wallpaper-form-wrapper />
	</template>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import SplashScreen from '@/library/SplashScreen.vue';
import MainLibrary from '@/library/MainLibrary.vue';
import WallpaperFormWrapper from '@/form/WallpaperFormWrapper.vue';

const task = ref<'splashscreen' | 'main' | 'form' | ''>('');

const toggleVideoGifPlayingStatus = () => {
	window.onblur = () => {
		document.querySelectorAll('video').forEach((video) => video.pause());
		document.querySelectorAll('img').forEach((gif) => {
			if (!gif.src.startsWith('data:image/gif') && !gif.src.endsWith('.gif')) return;
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			if (context) context.drawImage(gif, 0, 0, (canvas.width = gif.width), (canvas.height = gif.height));
			(gif as unknown as { origin: string }).origin = gif.src;
			gif.src = canvas.toDataURL('image/gif');
		});
	};
	window.onfocus = () => {
		document.querySelectorAll('video').forEach((video) => video.play());
		document.querySelectorAll('img').forEach((i) => (i.src = (i as unknown as { origin: string }).origin || i.src));
	};
};

onMounted(async () => {
	toggleVideoGifPlayingStatus();
	const queryParams: Record<string, string> = {};
	new URLSearchParams(window.location.search).forEach((value, key) => (queryParams[key] = value));
	if (queryParams.splashscreen) {
		task.value = 'splashscreen';
	} else if (queryParams.main) {
		task.value = 'main';
	} else if (queryParams.form) {
		task.value = 'form';
	}
});
</script>
