<template>
	<title-bar />
	<header-component />
	<div class="dashboard">Dashboard</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventsBus from '@/global/events';

import TitleBar from '@/components/TitleBar.vue';
import HeaderComponent from '@/components/Header.vue';

export default defineComponent({
	name: 'DashboardPage',
	components: { TitleBar, HeaderComponent },
	created() {
		eventsBus.$on('onAppReady', () => {
			console.log('App is ready');
		});
	},
});
</script>
