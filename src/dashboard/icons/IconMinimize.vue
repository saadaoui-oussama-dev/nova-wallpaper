<template>
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M7.5 12H16.5" :stroke="color" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</template>

<script lang="ts" setup>
// eslint-disable-next-line
const props = defineProps({
	color: { type: String, default: 'currentColor' },
});
</script>
