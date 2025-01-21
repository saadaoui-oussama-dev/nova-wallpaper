<template>
	<title-bar />
	<header-component />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventsBus from '@/global/events';

import TitleBar from '@/dashboard/components/TitleBar.vue';
import HeaderComponent from '@/dashboard/components/Header.vue';

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
