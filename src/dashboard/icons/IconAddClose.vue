<template>
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g :class="{ cross: isX }">
			<path d="M12 4.5L12 19.5" :stroke="color" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M4.5 12L19.5 12" :stroke="color" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
		</g>
	</svg>
</template>

<script lang="ts" setup>
import { defineProps, defineExpose, ref } from 'vue';

const props = defineProps({
	color: { type: String, default: 'currentColor' },
});

const isX = ref(false);

const toggleIcon = () => {
	isX.value = !isX.value;
	return isX.value ? 'close' : 'plus';
};

defineExpose({ toggleIcon });
</script>

<style scoped>
g {
	transition: transform 0.3s ease;
	transform-origin: 50% 50%;
}

g.cross {
	transform: rotate(45deg);
}
</style>
