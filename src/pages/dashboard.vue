<template>
	<div class="dashboard">Dashboard</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import events from '@/events';

export default defineComponent({
	name: 'DashboardPage',
	created() {
		events.$on('onAppReady', () => {
			console.log('App is ready');
		});
	},
});
</script>
