<template>
	<div v-if="splashscreen" class="splashscreen">
		<img alt="Vue logo" src="/imgs/logo.png" width="150" />
	</div>
	<div class="app">
		<dashboard v-show="!splashscreen" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { setPreloadListener } from '@/global/preload';
import eventsBus from '@/global/events';
import Dashboard from '@/dashboard/page.vue';

export default defineComponent({
	name: 'App',
	components: { Dashboard },
	data: () => ({
		splashscreen: true,
	}),
	created() {
		setPreloadListener();
	},
	mounted() {
		setTimeout(() => document.body.classList.add('ready'), 2000);
		setTimeout(() => {
			this.splashscreen = false;
			eventsBus.$emit('onAppReady');
		}, 3000);
	},
});
</script>
