<template>
	<div v-if="task === 'splashscreen'" class="splashscreen">
		<img src="/img/logo.png" width="150" alt="" />
	</div>
	<div class="app" v-if="task === 'main'">
		<page-header :visible="visible" @action="pageHeaderAction" />
		<div class="dashboard">
			<div :class="`pages${store.formWallpaper ? ' page-2' : ''}`">
				<div class="main" ref="main">
					<new-wallpaper :visible="visible" @collapse="pageHeaderAction('collapse')" />
					<wallpapers-list @collapse="pageHeaderAction('collapse')" />
				</div>
				<wallpaper-form ref="form" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, onMounted } from 'vue';
import { useWallpaperStore } from '@/global/store';
import { NovaWallpaper } from '@/global/vue';
import PageHeader from '@/components/PageHeader.vue';
import WallpapersList from '@/components/WallpapersList.vue';
import NewWallpaper from '@/components/NewWallpaper.vue';
import WallpaperForm from '@/form/WallpaperForm.vue';

const store = useWallpaperStore();

const task = ref<'main' | 'splashscreen' | ''>('');

const visible = ref(false);

const main = useTemplateRef('main');

const form = useTemplateRef('form');

const pageHeaderAction = (action: string) => {
	if (action === 'collapse') {
		visible.value = false;
	} else if (action === 'expand') {
		visible.value = true;
		if (main.value) main.value.scrollTo({ top: 0, behavior: 'smooth' });
	} else if (action === 'delete') {
		if (form.value) form.value.remove();
	} else if (action === 'finish') {
		if (form.value) form.value.finish();
	} else if (action === 'restore') {
		console.log('restore');
	}
};

const toggleVideoGifPlayingStatus = () => {
	window.onblur = () => {
		document.querySelectorAll('video').forEach((video) => video.pause());
		document.querySelectorAll('img').forEach((gif) => {
			if (!gif.src.startsWith('data:image/gif') && !gif.src.endsWith('.gif')) return;
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			if (context) context.drawImage(gif, 0, 0, (canvas.width = gif.width), (canvas.height = gif.height));
			(gif as unknown as { origin: string }).origin = gif.src;
			gif.src = canvas.toDataURL('image/gif');
		});
	};
	window.onfocus = () => {
		document.querySelectorAll('video').forEach((video) => video.play());
		document.querySelectorAll('img').forEach((i) => (i.src = (i as unknown as { origin: string }).origin || i.src));
	};
};

onMounted(async () => {
	const queryParams: Record<string, string> = {};
	new URLSearchParams(window.location.search).forEach((value, key) => (queryParams[key] = value));
	if (queryParams.main) {
		task.value = 'main';
		document.documentElement.classList.add('main');
		NovaWallpaper.database.on('refresh', () => store.readData());
		toggleVideoGifPlayingStatus();
		await Promise.all([store.readData(), new Promise((resolve) => setTimeout(resolve, 1500))]);
		if (!store.wallpapers.length) visible.value = true;
		NovaWallpaper.window.send('close-splashscreen');
	} else if (queryParams.splashscreen) {
		task.value = 'splashscreen';
	}
});
</script>

<style scoped>
#app .app {
	display: flex;
	flex-direction: column;
	font-size: 14px;
}

#app .app .dashboard {
	flex: 1;
	overflow: hidden;
}

#app .app .pages {
	width: 200vw;
	height: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr;
	transition: transform 0.3s ease-in-out;
}

#app .app .pages.page-2 {
	transform: translateX(-100vw);
}

#app .app .pages > * {
	height: calc(100% - 20px);
	padding-inline: 20px;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
