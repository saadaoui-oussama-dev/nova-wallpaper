<template>
	<title-bar />
	<header-component />
	<div class="dashboard">
		<div class="options">
			<div
				:class="`option${option.class}`"
				v-for="option in globalOptions"
				:key="option.label"
				@mousedown="clicked(option.label, true)"
				@mouseup="clicked(option.label, false)"
				@click="createWallpaper(option.type)"
			>
				<component :is="option.icon" />
				<div class="option-label">{{ option.label }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventsBus from '@/global/events';

import TitleBar from '@/dashboard/components/TitleBar.vue';
import HeaderComponent from '@/dashboard/components/Header.vue';
import IconAdd from '@/dashboard/icons/IconAdd.vue';
import IconImport from '@/dashboard/icons/IconImport.vue';
import IconMediaFolder from '@/dashboard/icons/IconMediaFolder.vue';

export default defineComponent({
	name: 'DashboardPage',
	components: { TitleBar, HeaderComponent, IconAdd, IconImport, IconMediaFolder },
	data: () => ({
		globalOptions: [
			{ label: 'Create Stickers Wallpaper', icon: 'icon-add', type: 'stickers', class: '' },
			{ label: 'Import Wallpaper', icon: 'icon-import', type: 'file', class: '' },
			{ label: 'Import Carousel Folder', icon: 'icon-media-folder', type: 'folder', class: '' },
		],
	}),
	created() {
		eventsBus.$on('onAppReady', () => {
			console.log('App is ready');
		});
	},
	methods: {
		createWallpaper(type: string) {
			console.log(type);
		},
		clicked(key: string, isDown: boolean) {
			this.globalOptions = this.globalOptions.map((it) => {
				const className = it.label === key && isDown ? ' clicked' : '';
				return { ...it, class: className };
			});
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
