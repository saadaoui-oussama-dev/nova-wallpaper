<template>
	<svg v-if="!isFullscreen" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="8" y="8" width="8" height="8" :stroke="color" stroke-width="0.7" stroke-linejoin="round" />
	</svg>

	<svg
		v-else
		style="opacity: 0.6"
		version="1.0"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 512.000000 512.000000"
		preserveAspectRatio="xMidYMid meet"
	>
		<g transform="translate(150,400) scale(0.052,-0.052)" :fill="color" stroke="none">
			<path
				d="M1390 4747 c-172 -58 -303 -203 -345 -379 -8 -35 -15 -111 -15 -170 l0 -108 -107 0 c-126 0 -209 -17 -295 -61 -75 -38 -181 -142 -220 -215 -61 -113 -58 -35 -58 -1599 0 -1281 2 -1437 16 -1486 52 -177 186 -311 363 -363 49 -14 205 -16 1486 -16 1564 0 1486 -3 1599 58 73 39 177 145 215 220 44 86 61 169 61 295 l0 107 108 0 c125 0 208 17 294 61 75 38 181 142 220 215 61 113 58 35 58 1599 0 1281 -2 1437 -16 1486 -52 176 -187 311 -363 363 -49 14 -205 16 -1495 16 l-1441 -1 -65 -22z m2943 -311 c39 -17 92 -71 106 -109 8 -20 11 -466 11 -1430 l0 -1402 -23 -40 c-12 -21 -42 -53 -65 -70 -41 -28 -50 -30 -158 -34 l-114 -3 -2 1163 -3 1164 -22 57 c-70 185 -219 315 -397 347 -40 8 -426 11 -1188 11 l-1128 0 0 93 c0 50 5 109 10 129 13 47 52 93 99 118 35 19 76 19 1439 20 1171 0 1408 -2 1435 -14z m-687 -685 c23 -10 53 -32 68 -47 60 -65 57 22 54 -1506 l-3 -1396 -30 -44 c-17 -23 -49 -53 -70 -65 l-40 -23 -1416 3 -1415 2 -36 24 c-19 13 -46 40 -59 59 l-24 36 -3 1413 c-2 1375 -2 1414 17 1451 24 46 56 76 101 96 31 13 206 15 1425 15 1335 1 1392 0 1431 -18z"
			/>
		</g>
	</svg>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { NovaWallpaper } from '../preload';

// eslint-disable-next-line
const props = defineProps({
	color: { type: String, default: 'currentColor' },
});

const isFullscreen = ref(false);

onMounted(() => {
	NovaWallpaper.window.on('is-maximized', (value) => (isFullscreen.value = value));
	window.addEventListener('resize', async () => NovaWallpaper.window.send('is-maximized'));
});
</script>
