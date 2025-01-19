<template>
	<div class="app">
		<img alt="Vue logo" src="./assets/images/logo.png" width="150" />
		<h1>Nova Wallpaper</h1>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import events from './events';

export default defineComponent({
	name: 'App',
	created() {
		events.$emit('onAppReady');
	},
});
</script>

<style>
.app {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 1.5rem;
}
</style>
