<template>
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M18 9L9 18" :stroke="color" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" />
		<path d="M9 9L18 18" :stroke="color" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'IconClose',
	props: {
		color: { type: String, default: 'currentColor' },
	},
});
</script>
