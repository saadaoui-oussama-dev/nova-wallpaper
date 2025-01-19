<template>
	<div class="app">
		<img class="splashscreen" v-if="splashscreen" alt="Vue logo" src="./assets/images/logo.png" width="150" />
		<dashboard v-show="!splashscreen" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import events from './events';
import Dashboard from './pages/dashboard.vue';

export default defineComponent({
	name: 'App',
	components: { Dashboard },
	data: () => ({
		splashscreen: true,
	}),
	mounted() {
		setTimeout(() => document.body.classList.add('ready'), 2000);
		setTimeout(() => {
			this.splashscreen = false;
			events.$emit('onAppReady');
		}, 3000);
	},
});
</script>

<style scoped>
.app {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 1.5rem;
}

.splashscreen {
	opacity: 1;
	transition: opacity 0.7s ease-in-out;
	transition-delay: 0.2s;
}

.ready .splashscreen {
	opacity: 0;
}
</style>
