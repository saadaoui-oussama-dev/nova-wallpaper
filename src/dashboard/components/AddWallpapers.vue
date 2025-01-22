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
				<component :is="option.icon" />
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

type Option = { label: string; icon: string; type: string; class: string };

const options = ref<(Option | undefined)[]>([
	{ label: 'Import Image', icon: 'icon-file-image', type: 'image', class: '' },
	{ label: 'Import Video', icon: 'icon-file-video', type: 'video', class: '' },
	{ label: 'Import Webpage', icon: 'icon-file-webpage', type: 'html', class: '' },
	undefined,
	{ label: 'Import Carousel Folder', icon: 'icon-folder-media', type: 'folder', class: '' },
	{ label: 'Import Stickers Wallpaper', icon: 'icon-file-objects', type: 'stickers', class: '' },
	{ label: 'Create Stickers Wallpaper', icon: 'icon-file-add', type: 'create', class: '' },
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
	if (type !== 'folder') return console.log({ path });
	if (!content.length) return console.log({ path, message: 'Folder is empty' });
	console.log({ path, content });
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
