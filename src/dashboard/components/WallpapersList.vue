<template>
	<div v-if="wallpapers.length !== 0" class="wallpapers">
		<div
			v-for="wallpaper in wallpapers"
			:key="wallpaper.id"
			class="card"
			:class="{ active: wallpaper.id === store.activeWallpaper }"
			@click="store.setActiveWallpaper(wallpaper)"
		>
			<wallpaper-preview :wallpaper="wallpaper" muted only-preview />

			<div class="info">
				<span class="label">{{ getFileName(`${wallpaper.label || ''}`, 'name', 25) }}</span>
				<div class="actions">
					<button class="icon-btn star" @click.stop="store.toggleFavorite(wallpaper)">
						{{ wallpaper.favorite ? '★' : '☆' }}
					</button>

					<button class="icon-btn edit" @click.stop="editWallpaper(wallpaper)">✎</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useWallpaperStore, Wallpaper } from '@/dashboard/store';
import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';
import { getFileName } from '@/global/utils';

const store = useWallpaperStore();
const wallpapers = computed(() => store.wallpapers);

const editWallpaper = (wallpaper: Wallpaper) => console.log('Edit wallpaper:', wallpaper);
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
</style>
