<template>
	<div :class="`wrapper${visible ? '' : ' collapsed'}`">
		<div class="options">
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
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useWallpaperStore } from '@/global/store';
import { NovaWallpaper } from '@/electron-vue/preload';
import IconFileAdd from '@/library/icons/IconFileAdd.vue';
import IconFileImage from '@/library/icons/IconFileImage.vue';
import IconFileObjects from '@/library/icons/IconFileObjects.vue';
import IconFileWebpage from '@/library/icons/IconFileWebpage.vue';
import IconFolderMedia from '@/library/icons/IconFolderMedia.vue';

// eslint-disable-next-line
const props = defineProps<{ visible: boolean }>();

// eslint-disable-next-line
const emit = defineEmits(['collapse']);

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
	// { label: 'Import Stickers Wallpaper', type: 'stickers', class: '' },
	// { label: 'Create Stickers Wallpaper', type: 'create', class: '' },
	{ label: 'Import Image/Video', type: 'media', class: '' },
	// { label: 'Import Carousel Folder', type: 'folder', class: '' },
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
	} else if (type === 'media' || type === 'webpage') {
		if (await store.addWallpaper(path, content)) emit('collapse');
	}
};
</script>

<style scoped>
.wrapper {
	display: grid;
	grid-template-rows: 1fr;
	overflow: hidden;
	transition: grid-template-rows 0.3s ease-in-out;
}

.options {
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 40px;
	gap: 10px;
	overflow: hidden;
	opacity: 1;
	transition: margin-bottom 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.option {
	width: 213px;
	height: 98px;
	padding: 15px 10px 15px;
	border: 2px solid var(--border-color);
	border-radius: 7px;
	cursor: pointer;
	overflow: hidden;
	transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, height 0.3s ease-in-out;
}

.wrapper.collapsed {
	grid-template-rows: 0fr;
}

.wrapper.collapsed .options {
	opacity: 0;
	margin-bottom: 0px;
}

.wrapper.collapsed .options .option {
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
