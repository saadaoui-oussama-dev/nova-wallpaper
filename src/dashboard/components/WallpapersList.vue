<template>
	<div v-if="wallpapers.length !== 0" class="wallpapers">
		<div
			v-for="wallpaper in wallpapers"
			:key="wallpaper.id"
			class="card"
			:class="{ active: wallpaper.id === store.activeWallpaper }"
			@click.stop="openMenuOrSetAsActive(wallpaper)"
		>
			<wallpaper-preview :wallpaper="wallpaper" muted only-preview />

			<div class="info">
				<span class="label">{{ getFileName(`${wallpaper.label || ''}`, 'name', 25) }}</span>

				<div class="menu-container">
					<button class="menu-btn" @click.stop="wallpaper.id === activeMenu ? closeMenu() : openMenu(wallpaper)">
						<span v-if="wallpaper.favorite" class="favorite">★</span>
						⋮
					</button>
					<div v-if="activeMenu === wallpaper.id" class="context-menu">
						<button @click.stop="toggleFavorite(wallpaper)">
							{{ wallpaper.favorite ? 'Remove from favorites' : 'Add to favorites' }}
						</button>
						<button @click.stop="editWallpaper(wallpaper)">Edit Settings</button>
						<button @click.stop="setActiveWallpaper(wallpaper)">
							{{ wallpaper.id === store.activeWallpaper ? 'Deactivate wallpaper' : 'Activate wallpaper' }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWallpaperStore, Wallpaper } from '@/dashboard/store';
import WallpaperPreview from '@/dashboard/components/WallpaperPreview.vue';
import { getFileName } from '@/global/utils';

const store = useWallpaperStore();

const wallpapers = computed(() => store.wallpapers);

const activeMenu = ref<string | null>(null);

const clickTimeoutId = ref<{ id: string; timeout: number } | null>(null);

const onAnyClick = (id?: string): boolean => {
	const current = clickTimeoutId.value ? clickTimeoutId.value.id : '';
	if (clickTimeoutId.value) clearTimeout(clickTimeoutId.value.timeout);
	clickTimeoutId.value = null;
	if (id && id !== activeMenu.value) closeMenu();
	return current === id;
};

const openMenuOrSetAsActive = async (wallpaper: Wallpaper) => {
	if (onAnyClick(wallpaper.id)) {
		setActiveWallpaper(wallpaper);
	} else {
		clickTimeoutId.value = {
			id: wallpaper.id,
			timeout: setTimeout(() => {
				clickTimeoutId.value = null;
				openMenu(wallpaper);
			}, 300) as unknown as number,
		};
	}
};

const openMenu = (wallpaper: Wallpaper) => {
	onAnyClick();
	activeMenu.value = wallpaper.id;
};

const closeMenu = () => {
	onAnyClick();
	activeMenu.value = null;
};

const toggleFavorite = (wallpaper: Wallpaper) => {
	onAnyClick(wallpaper.id);
	store.toggleFavorite(wallpaper);
};

const editWallpaper = (wallpaper: Wallpaper) => {
	onAnyClick(wallpaper.id);
	console.log('Edit wallpaper:', wallpaper);
};

const setActiveWallpaper = (wallpaper: Wallpaper) => {
	onAnyClick(wallpaper.id);
	setTimeout(() => {
		closeMenu();
		store.setActiveWallpaper(wallpaper.id === store.activeWallpaper ? null : wallpaper);
	}, 100);
};

onMounted(() => document.addEventListener('click', closeMenu));

onUnmounted(() => document.removeEventListener('click', closeMenu));
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
	position: relative;
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
	position: relative;
}

.menu-container {
	position: relative;
	height: 100%;
	right: -12px;
}

.menu-btn {
	height: 100%;
	background: none;
	border: none;
	color: white;
	cursor: pointer;
	font-size: 18px;
	padding-inline: 12px;
	border-radius: 7px;
}

.menu-btn .favorite {
	font-size: 15px;
	padding-right: 2px;
}

.menu-btn:hover {
	color: #ffcc00;
}

.context-menu {
	position: absolute;
	bottom: 0;
	right: 20px;
	background: var(--neutral-color);
	border-radius: 6px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	display: flex;
	flex-direction: column;
	padding: 6px 0;
	width: 170px;
	z-index: 100;
}

.context-menu button {
	background: none;
	border: none;
	width: 100%;
	padding: 8px 12px;
	text-align: left;
	color: white;
	cursor: pointer;
	font-size: 14px;
	transition: background-color 0.2s;
}

.context-menu button:hover {
	background-color: var(--primary-color);
}
</style>
