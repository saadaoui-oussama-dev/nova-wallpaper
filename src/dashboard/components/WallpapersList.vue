<template>
	<div v-if="wallpapers.length === 0" class="empty-state">List is empty</div>
	<div v-else class="wallpapers">
		<div
			v-for="wallpaper in wallpapers"
			:key="wallpaper.id"
			class="card"
			:class="{ active: wallpaper.id === activeWallpaperId }"
			@click="setActive(wallpaper.id)"
		>
			<wallpaper-preview :wallpaper="wallpaper" muted only-preview />

			<div class="info">
				<span class="label">{{ wallpaper.label }}</span>
				<div class="actions">
					<button class="icon-btn star" @click.stop="toggleFavorite(wallpaper)">
						{{ wallpaper.favorite ? '★' : '☆' }}
					</button>

					<button class="icon-btn edit" @click.stop="editWallpaper(wallpaper)">✎</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useWallpaperStore, Wallpaper } from '@/store';
import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';

const store = useWallpaperStore();
const wallpapers = computed(() => store.wallpapers);
const activeWallpaperId = ref<string | null>(null);

const setActive = (id: string) => {
	activeWallpaperId.value = id;
	console.log('Active wallpaper:', id);
};

const toggleFavorite = (wallpaper: Wallpaper) => {
	wallpaper.favorite = !wallpaper.favorite;
	console.log('Toggled favorite:', wallpaper);
};

const editWallpaper = (wallpaper: Wallpaper) => {
	console.log('Edit wallpaper:', wallpaper);
};
</script>

<style scoped>
.wallpapers {
	width: 460px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

.card {
	--width: 190;
	border-radius: 8px;
	overflow: hidden;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	padding: 12px;
	background-color: var(--neutral-color-normal);
	border: 2px solid var(--neutral-color-normal);
	transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.card:hover {
	background-color: var(--neutral-color);
	border-color: var(--neutral-color);
}

.card.active {
	border-color: var(--primary-color);
}

.info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	flex: 1;
	margin-top: 8px;
}

.actions {
	display: flex;
	gap: 6px;
}

.icon-btn {
	background: none;
	border: none;
	color: white;
	cursor: pointer;
	font-size: 16px;
}

.icon-btn:hover {
	color: #ffcc00;
}

.star {
	font-size: 18px;
}

.edit {
	font-size: 16px;
}

.empty-state {
	text-align: center;
	color: #aaa;
	font-size: 16px;
}
</style>
