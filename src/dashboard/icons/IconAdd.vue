<template>
	<svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M12 4.5L12 19.5" :stroke="color" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
		<path d="M4.5 12L19.5 12" :stroke="color" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</template>

<script lang="ts" setup>
// eslint-disable-next-line
const props = defineProps({
	color: { type: String, default: 'currentColor' },
});
</script>
