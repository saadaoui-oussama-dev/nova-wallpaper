<template>
	<title-bar />
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
import TitleBar from '@/components/TitleBar.vue';

export default defineComponent({
	name: 'DashboardPage',
	components: { TitleBar },
	created() {
		eventsBus.$on('onAppReady', () => {
			console.log('App is ready');
		});
	},
});
</script>
