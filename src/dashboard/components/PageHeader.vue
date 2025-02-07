<template>
	<div class="header">
		<h1>{{ store.formWallpaper ? 'Parameters' : 'Wallpapers' }}</h1>

		<div class="right-side">
			<button v-if="store.formWallpaper" class="text-btn" @click="emit('action', 'restore')">Restore</button>
			<button v-if="store.formWallpaper" class="text-btn primary" @click="emit('action', 'close')">Close</button>

			<button v-else-if="visible" class="text-btn fixed" @click="emit('action', 'collapse')">Cancel</button>
			<button v-else class="text-btn primary fixed" @click="emit('action', 'expand')">Add</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { useWallpaperStore } from '@/dashboard/store';

const emit = defineEmits(['action']);

const props = defineProps<{ visible: boolean }>();

const store = useWallpaperStore();
</script>

<style scoped>
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 15px 20px;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--border-color);
}

.right-side {
	display: flex;
	gap: 10px;
}

.text-btn {
	background-color: var(--neutral-color);
	border: none;
	border-radius: 7px;
	cursor: pointer;
	font-weight: 500;
	padding: 8px 20px;
	transition: background-color 0.15s ease-in-out;
}

.text-btn:hover {
	background-color: var(--neutral-hover);
}

.fixed {
	width: 85px;
}

.primary {
	background-color: var(--primary-color);
}

.primary:hover {
	background-color: var(--primary-color-active);
}
</style>
