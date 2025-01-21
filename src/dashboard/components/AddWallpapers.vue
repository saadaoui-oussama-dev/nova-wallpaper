<template>
	<div class="options">
		<div v-for="option in globalOptions" :key="option.label">
			<div v-if="!option.label"></div>
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

<script lang="ts">
import { defineComponent } from 'vue';

import IconFileAdd from '@/dashboard/icons/IconFileAdd.vue';
import IconFileImage from '@/dashboard/icons/IconFileImage.vue';
import IconFileVideo from '@/dashboard/icons/IconFileVideo.vue';
import IconFileObjects from '@/dashboard/icons/IconFileObjects.vue';
import IconFileWebpage from '@/dashboard/icons/IconFileWebpage.vue';
import IconFolderMedia from '@/dashboard/icons/IconFolderMedia.vue';

export default defineComponent({
	name: 'AddWallpapersComponent',
	components: { IconFileAdd, IconFileImage, IconFileVideo, IconFileObjects, IconFileWebpage, IconFolderMedia },
	data: () => ({
		globalOptions: [
			{ label: 'Import Image', icon: 'icon-file-image', type: 'image', class: '' },
			{ label: 'Import Video', icon: 'icon-file-video', type: 'video', class: '' },
			{ label: 'Import Webpage', icon: 'icon-file-webpage', type: 'html', class: '' },
			{ key: 0 },
			{ label: 'Import Carousel Folder', icon: 'icon-folder-media', type: 'folder', class: '' },
			{ label: 'Import Stickers Wallpaper', icon: 'icon-file-objects', type: 'stickers', class: '' },
			{ label: 'Create Stickers Wallpaper', icon: 'icon-file-add', type: 'create', class: '' },
		],
	}),
	methods: {
		clicked(option: any, isDown: boolean) {
			this.globalOptions = this.globalOptions.map((it) => {
				if (!it.label) return it;
				const className = it.label === option.label && isDown ? ' clicked' : '';
				return { ...it, class: className };
			});
		},
		createWallpaper(option: any) {
			console.log(option.type);
		},
	},
});
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
