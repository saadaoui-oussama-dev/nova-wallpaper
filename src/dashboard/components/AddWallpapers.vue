<template>
	<div class="options">
		<div v-for="option in options" :key="option ? option.label : 0">
			<div v-if="!option"></div>
			<div
				v-else
				:class="`option${option.class}`"
				@mousedown="clicked(option, true)"
				@mouseup="clicked(option, false)"
				@click="createWallpaper(option)"
			>
				<component :is="icons[option.type]" />
				<div class="option-label">{{ option.label }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Component, ref } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';
import { getFileName } from '@/global/utils';

import IconFileAdd from '@/dashboard/icons/IconFileAdd.vue';
import IconFileImage from '@/dashboard/icons/IconFileImage.vue';
import IconFileVideo from '@/dashboard/icons/IconFileVideo.vue';
import IconFileObjects from '@/dashboard/icons/IconFileObjects.vue';
import IconFileWebpage from '@/dashboard/icons/IconFileWebpage.vue';
import IconFolderMedia from '@/dashboard/icons/IconFolderMedia.vue';

import { useWallpaperStore, Wallpaper } from '@/store';
const store = useWallpaperStore();

type Option = { label: string; type: 'image' | 'video' | 'webpage' | 'folder' | 'stickers' | 'create'; class: string };

const icons: { [k in Option['type']]: Component } = {
	image: IconFileImage,
	video: IconFileVideo,
	webpage: IconFileWebpage,
	folder: IconFolderMedia,
	stickers: IconFileObjects,
	create: IconFileAdd,
};

const options = ref<(Option | undefined)[]>([
	{ label: 'Import Image', type: 'image', class: '' },
	{ label: 'Import Video', type: 'video', class: '' },
	{ label: 'Import Webpage', type: 'webpage', class: '' },
	undefined,
	{ label: 'Import Carousel Folder', type: 'folder', class: '' },
	{ label: 'Import Stickers Wallpaper', type: 'stickers', class: '' },
	{ label: 'Create Stickers Wallpaper', type: 'create', class: '' },
]);

const clicked = (option: Option, isDown: boolean) => {
	options.value = options.value.map((it) => {
		if (!it) return it;
		const className = it.label === option.label && isDown ? ' clicked' : '';
		return { ...it, class: className };
	});
};

const createWallpaper = async ({ type }: Option) => {
	const { path, content } = (await NovaWallpaper.files.invoke(type)) as { path: string; content: string[] };
	if (!path) return;
	else if (type !== 'folder' && type !== 'create') {
		const wallpaper: Wallpaper = { id: '', label: getFileName(path, 'path', 30), type, path, settings: {} };
		store.prepareToAddWallpaper(wallpaper);
	} else if (!content.length) {
		console.log({ path, message: 'Folder is empty' });
	} else {
		console.log({ path, content });
	}
};
</script>

<style scoped>
.options {
	display: grid;
	grid-template-columns: repeat(3, 1fr) 0.5fr;
	gap: 12px;
	width: 100%;
	padding-left: 20px;
}

.option {
	border: 2px solid var(--window-border);
	border-radius: 13px;
	cursor: pointer;
	padding: 20px 10px;
	transition: all 0.2s ease-in-out;
}

.option:hover {
	background-color: var(--neutral-color);
	transform: scale(0.99);
}

.option.clicked:hover {
	transform: scale(0.97);
}

.option > .option-label {
	margin-top: 15px;
}
</style>
