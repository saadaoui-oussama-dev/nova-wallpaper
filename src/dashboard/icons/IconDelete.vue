<template>
	<svg
		style="enable-background: new 0 0 24 24"
		version="1.1"
		width="19"
		height="19"
		viewBox="0 0 24 24"
		xml:space="preserve"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:fill="color"
	>
		<path d="M10,11c-0.6,0-1,0.4-1,1v4c0,0.6,0.4,1,1,1s1-0.4,1-1v-4C11,11.4,10.6,11,10,11z" />
		<path d="M14,11c-0.6,0-1,0.4-1,1v4c0,0.6,0.4,1,1,1s1-0.4,1-1v-4C15,11.4,14.6,11,14,11z" />
		<path
			d="M13.5,2h-3C9.1,2,8,3.1,8,4.5V5H5C4.4,5,4,5.4,4,6s0.4,1,1,1h0.1l0.8,11.2C6,20.4,7.7,22,9.8,22h4.4c2.1,0,3.9-1.6,4-3.7 L18.9,7H19c0.6,0,1-0.4,1-1s-0.4-1-1-1h-3V4.5C16,3.1,14.9,2,13.5,2z M10,4.5C10,4.2,10.2,4,10.5,4h3C13.8,4,14,4.2,14,4.5V5h-4 V4.5z M16.9,7l-0.8,11.1c-0.1,1.1-0.9,1.9-2,1.9H9.8c-1.1,0-1.9-0.8-2-1.9L7.1,7H9h6H16.9z"
		/>
	</svg>
</template>

<script lang="ts" setup>
// eslint-disable-next-line
const props = defineProps({
	color: { type: String, default: 'currentColor' },
});
</script>

<style scoped>
svg {
	opacity: 0.8;
}
</style>
