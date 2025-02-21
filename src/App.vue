<template>
	<template v-if="task === 'main'">
		<main-dashboard />
	</template>

	<template v-else-if="task === 'splashscreen'">
		<splash-screen />
	</template>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import MainDashboard from '@/dashboard/MainDashboard.vue';
import SplashScreen from '@/dashboard/SplashScreen.vue';

const task = ref<'main' | 'splashscreen' | ''>('');

onMounted(async () => {
	const queryParams: Record<string, string> = {};
	new URLSearchParams(window.location.search).forEach((value, key) => (queryParams[key] = value));
	if (queryParams.main) {
		task.value = 'main';
	} else if (queryParams.splashscreen) {
		task.value = 'splashscreen';
	}
});
</script>
