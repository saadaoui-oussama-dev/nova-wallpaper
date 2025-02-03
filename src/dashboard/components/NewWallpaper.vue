<template>
	<div :class="`options ${visible ? ' ' : 'collapsed'}`">
		<div v-for="option in options" :key="option.label">
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
import { ref, defineProps, defineEmits } from 'vue';
import { useWallpaperStore, WallpaperType } from '@/dashboard/store';
import { NovaWallpaper } from '@/dashboard/preload';

import IconFileAdd from '@/dashboard/icons/IconFileAdd.vue';
import IconFileImage from '@/dashboard/icons/IconFileImage.vue';
import IconFileObjects from '@/dashboard/icons/IconFileObjects.vue';
import IconFileWebpage from '@/dashboard/icons/IconFileWebpage.vue';
import IconFolderMedia from '@/dashboard/icons/IconFolderMedia.vue';

const emit = defineEmits(['close']);

const props = defineProps<{ visible: boolean }>();

const store = useWallpaperStore();

type Option = { label: string; type: 'media' | 'webpage' | 'folder' | 'stickers' | 'create'; class: string };

const icons = {
	media: IconFileImage,
	webpage: IconFileWebpage,
	folder: IconFolderMedia,
	stickers: IconFileObjects,
	create: IconFileAdd,
};

const options = ref<Option[]>([
	{ label: 'Import Stickers Wallpaper', type: 'stickers', class: '' },
	{ label: 'Create Stickers Wallpaper', type: 'create', class: '' },
	{ label: 'Import Image/Video', type: 'media', class: '' },
	{ label: 'Import Carousel Folder', type: 'folder', class: '' },
	{ label: 'Import Webpage', type: 'webpage', class: '' },
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
		emit('close');
		let selectedType: WallpaperType = 'image';
		if (path.toLocaleLowerCase().endsWith('.mp4')) selectedType = 'video';
		else if (path.toLocaleLowerCase().endsWith('.html')) selectedType = 'webpage';
		store.prepareToAddWallpaper(selectedType, path, content);
	}
};
</script>

<style scoped>
.options {
	width: 460px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	padding: 0 25px 0 0px;
	margin-bottom: 40px;
	background-color: var(--window-bg);
	height: 314px;
	overflow: hidden;
	opacity: 1;
	transition: margin-bottom 0.3s ease-in-out, opacity 0.3s ease-in-out, height 0.3s ease-in-out;
}

.option {
	border: 2px solid var(--window-border);
	border-radius: 7px;
	cursor: pointer;
	padding: 15px 10px 15px;
	height: 98px;
	overflow: hidden;
	transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, height 0.3s ease-in-out;
}

.options.collapsed {
	height: 0;
	opacity: 0;
	margin-bottom: 0px;
}

.options.collapsed .option {
	height: 0;
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
