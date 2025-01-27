<template>
	<div class="options">
		<div v-for="option in options" :key="option ? option.label : 0">
			<div
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
import { ref } from 'vue';
import { NovaWallpaper } from '@/dashboard/preload';

import IconFileAdd from '@/dashboard/icons/IconFileAdd.vue';
import IconFileImage from '@/dashboard/icons/IconFileImage.vue';
import IconFileVideo from '@/dashboard/icons/IconFileVideo.vue';
import IconFileObjects from '@/dashboard/icons/IconFileObjects.vue';
import IconFileWebpage from '@/dashboard/icons/IconFileWebpage.vue';
import IconFolderMedia from '@/dashboard/icons/IconFolderMedia.vue';

import { useWallpaperStore, Wallpaper } from '@/store';
const store = useWallpaperStore();

type Option = { label: string; type: 'image' | 'video' | 'webpage' | 'folder' | 'stickers' | 'create'; class: string };

const icons: { [k in Option['type']]: any } = {
	image: IconFileImage,
	video: IconFileVideo,
	webpage: IconFileWebpage,
	folder: IconFolderMedia,
	stickers: IconFileObjects,
	create: IconFileAdd,
};

const options = ref<Option[]>([
	{ label: 'Import Image', type: 'image', class: '' },
	{ label: 'Import Carousel Folder', type: 'folder', class: '' },
	{ label: 'Import Video', type: 'video', class: '' },
	{ label: 'Import Stickers Wallpaper', type: 'stickers', class: '' },
	{ label: 'Import Webpage', type: 'webpage', class: '' },
	{ label: 'Create Stickers Wallpaper', type: 'create', class: '' },
]);

const clicked = (option: Option, isDown: boolean) => {
	options.value = options.value.map((it) => {
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
	display: grid;
	grid-template-columns: 0.95fr 1fr;
	gap: 10px;
	width: 100%;
	padding-right: 35px;
}

.option {
	border: 2px solid var(--window-border);
	border-radius: 7px;
	cursor: pointer;
	padding: 15px 10px 15px;
	transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.option .option-label {
	margin-top: 17px;
}

.option:hover {
	background-color: var(--neutral-color);
	transform: scale(0.99);
}

.option.clicked:hover {
	transform: scale(0.97);
}
</style>
