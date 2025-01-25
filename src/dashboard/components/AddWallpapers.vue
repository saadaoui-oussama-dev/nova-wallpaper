<template>
	<div :class="`options${collapsed ? ' collapsed' : ''}`">
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
import { events } from '@/global/utils';

import IconFileAdd from '@/dashboard/icons/IconFileAdd.vue';
import IconFileImage from '@/dashboard/icons/IconFileImage.vue';
import IconFileVideo from '@/dashboard/icons/IconFileVideo.vue';
import IconFileObjects from '@/dashboard/icons/IconFileObjects.vue';
import IconFileWebpage from '@/dashboard/icons/IconFileWebpage.vue';
import IconFolderMedia from '@/dashboard/icons/IconFolderMedia.vue';

import { useWallpaperStore, Wallpaper } from '@/store';
const store = useWallpaperStore();

const collapsed = ref(store.wallpapers.length > 0);

events.$on('icon-add-toggle', (state: 'plus' | 'close') => {
	collapsed.value = state === 'plus';
});

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
	const { path, content, error } = await NovaWallpaper.files.invoke(type);
	if (error || !path || !content) {
		return console.log({ error });
	} else if (type !== 'create') {
		const wallpaper: Wallpaper = { id: '', label: '', type, path, content, settings: {} };
		store.prepareToAddWallpaper(wallpaper);
	}
};
</script>

<style scoped>
.options {
	height: 220px;
	overflow: hidden;
	display: grid;
	grid-template-columns: repeat(3, 1fr) 0.4fr;
	grid-template-rows: repeat(2, 1fr);
	gap: 10px;
	width: 100%;
	padding-left: 20px;
	transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.option {
	overflow: hidden;
	height: 105px;
	border: 2px solid var(--window-border);
	border-radius: 13px;
	cursor: pointer;
	padding: 17px 10px 0px;
	transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, height 0.3s ease-in-out;
}

.option .option-label {
	margin-top: 15px;
}

.option:hover {
	background-color: var(--neutral-color);
	transform: scale(0.99);
}

.option.clicked:hover {
	transform: scale(0.97);
}

.collapsed {
	height: 0px;
	opacity: 0;
}

.collapsed .option {
	height: 0px;
}
</style>
