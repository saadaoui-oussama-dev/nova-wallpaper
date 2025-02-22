<template>
	<div class="form">
		<div class="buttons">
			<!-- <button class="text-btn" @click="formAction('restore')">Reset All</button> -->
			<button class="text-btn danger" @click="formAction('delete')">Delete</button>
			<button class="text-btn primary" @click="formAction('finish')">Finish</button>
		</div>

		<div class="content">
			<wallpaper-form ref="form" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useTemplateRef, onMounted } from 'vue';
import { useWallpaperStore } from '@/global/store';
import { NovaWallpaper } from '@/electron-vue/preload';
import WallpaperForm from '@/form/WallpaperForm.vue';

const store = useWallpaperStore();

const form = useTemplateRef('form');

const formAction = (action: 'delete' | 'finish' | 'restore') => {
	if (action === 'delete') {
		if (form.value) form.value.remove();
	} else if (action === 'finish') {
		if (form.value) form.value.finish();
	} else if (action === 'restore') {
		console.log('restore');
	}
};

onMounted(async () => {
	document.documentElement.style.backgroundColor = 'var(--body-bg)';
	store.viewWallpaper();
	NovaWallpaper.database.on('refresh', () => store.viewWallpaper());
});
</script>

<style scoped>
.form {
	height: 100%;
	display: flex;
	flex-direction: column;
	font-size: 14px;
	margin-bottom: 20px;
	overflow: hidden;
}

.content {
	flex: 1;
	padding-inline: 20px;
	overflow-y: auto;
	overflow-x: hidden;
}

.buttons {
	display: flex;
	justify-content: flex-end;
	gap: 7px;
	margin: 15px 20px;
	padding-bottom: 15px;
	border-bottom: 1px solid var(--border-color);
}

.text-btn {
	background-color: var(--neutral-color);
	border: none;
	border-radius: 7px;
	cursor: pointer;
	font-weight: 500;
	padding: 5px 17px;
	font-size: 13px;
	transition: background-color 0.15s ease-in-out;
}

.text-btn:hover {
	background-color: var(--neutral-hover);
}

.fixed {
	width: 85px;
}

.danger {
	background-color: var(--danger-color);
}

.danger:hover {
	background-color: var(--danger-color-hover);
}

.primary {
	background-color: var(--primary-color);
}

.primary:hover {
	background-color: var(--primary-color-active);
}
</style>
