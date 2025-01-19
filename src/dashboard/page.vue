<template>
	<div class="dashboard">
		<div class="font-standard">
			<p>Standard font</p>
		</div>

		<div class="font-handwritten">
			<p>Handwritten font</p>
		</div>
	</div>
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
