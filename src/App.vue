<template>
	<div v-if="splashscreen" class="splashscreen">
		<img alt="Vue logo" src="/imgs/logo.png" width="150" />
	</div>
	<div :class="`app font-${settings.font}`">
		<dashboard v-show="!splashscreen" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventsBus from '@/global/events';
import Dashboard from '@/dashboard/index.vue';

export default defineComponent({
	name: 'App',
	components: { Dashboard },
	data: () => ({
		splashscreen: true,
	}),
	computed: {
		settings() {
			return this.$store.state.settings;
		},
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

<style>
#app .app:not(.font-standard):not(.font-handwritten),
#app .app.font-standard,
.font-standard:not(#app .app) {
	font-family: system-ui, 'Trebuchet MS', 'Segoe UI', Helvetica, Arial;
}

#app .app.font-handwritten,
.font-handwritten:not(#app .app) {
	font-family: cursive, 'Comic Sans MS', 'Trebuchet MS', system-ui, 'Segoe UI', Helvetica, Arial;
	font-size: 0.93em;
}
</style>
