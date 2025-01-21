<template>
	<title-bar />
	<header-component />
	<div class="dashboard">
		<add-wallpapers />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventsBus from '@/global/events';

import TitleBar from '@/dashboard/components/TitleBar.vue';
import HeaderComponent from '@/dashboard/components/Header.vue';
import AddWallpapers from './components/AddWallpapers.vue';

export default defineComponent({
	name: 'DashboardPage',
	components: { TitleBar, HeaderComponent, AddWallpapers },
	created() {
		eventsBus.$on('onAppReady', () => {
			console.log('App is ready');
		});
	},
});
</script>
