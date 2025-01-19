<template>
	<div class="dashboard">Dashboard</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventsBus from '@/global/events';

export default defineComponent({
	name: 'DashboardPage',
	created() {
		eventsBus.$on('onAppReady', () => {
			console.log('App is ready');
		});
	},
});
</script>
