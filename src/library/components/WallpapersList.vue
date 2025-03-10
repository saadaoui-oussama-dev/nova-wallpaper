<template>
	<div v-if="wallpapers.length !== 0" class="wallpapers">
		<div
			v-for="wallpaper in wallpapers"
			:key="wallpaper.id"
			class="wallpaper"
			:class="{ active: wallpaper.id === store.activeWallpaper }"
			@click.stop="openMenuOrSetAsActive(wallpaper)"
		>
			<wallpaper-preview :wallpaper="wallpaper" only-preview />

			<div class="info">
				<span class="label">{{ getFileName(wallpaper.label, 'name', 25) || 'Untitled Wallpaper' }}</span>

				<div class="menu-container">
					<button class="menu-btn favorite" @click.stop="toggleFavorite(wallpaper)">
						{{ wallpaper.favorite ? '★' : '☆' }}
					</button>
					<button class="menu-btn" @click.stop="wallpaper.id === activeMenu ? closeMenu() : openMenu(wallpaper)">
						⋮
					</button>

					<div v-if="activeMenu === wallpaper.id" class="context-menu">
						<button class="danger" @click.stop="deleteWallpaper(wallpaper)">Delete</button>
						<button @click.stop="toggleFavorite(wallpaper)">
							{{ wallpaper.favorite ? 'Remove from favorites' : 'Add to favorites' }}
						</button>
						<button @click.stop="editWallpaper(wallpaper)">Customize</button>
						<button @click.stop="setActiveWallpaper(wallpaper)">
							{{ wallpaper.id === store.activeWallpaper ? 'Deactivate' : 'Activate' }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWallpaperStore } from '@/global/store';
import { getFileName } from '@/global/files';
import { useDialog } from '@/global/dialog';
import { Wallpaper } from '@/types/wallpaper';
import WallpaperPreview from '@/global/WallpaperPreview.vue';

// eslint-disable-next-line
const emit = defineEmits(['collapse']);

const store = useWallpaperStore();

const wallpapers = computed(() => store.wallpapers);

const activeMenu = ref<number | null>(null);

const clickTimeoutId = ref<{ id: number; timeout: number } | null>(null);

const onAnyClick = (id?: number): boolean => {
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

const toggleFavorite = async (wallpaper: Wallpaper) => {
	onAnyClick(wallpaper.id);
	await store.updateWallpaper({ id: wallpaper.id, favorite: !wallpaper.favorite });
	await store.readData();
};

const deleteWallpaper = async (wallpaper: Wallpaper) => {
	onAnyClick(wallpaper.id);
	const response = await useDialog('Are you sure you want to delete this wallpaper?', {
		neutralBtn: 'Cancel',
		primaryBtn: { text: 'Delete', danger: true },
	});
	if (response) await store.deleteWallpaper(wallpaper, 'library');
};

const editWallpaper = async (wallpaper: Wallpaper) => {
	onAnyClick(wallpaper.id);
	if (await store.selectWallpaper(wallpaper)) emit('collapse');
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
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.wallpaper {
	--width: 190;
	width: 224px;
	border-radius: 8px;
	overflow: hidden;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	padding: 12px;
	background-color: var(--content-bg);
	border: 2px solid var(--content-bg);
	transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
	position: relative;
}

.wallpaper:hover {
	background-color: var(--neutral-color);
	border-color: var(--neutral-color);
}

.wallpaper.active {
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
	display: flex;
	position: relative;
	height: 100%;
	right: -12px;
}

.menu-btn {
	height: 100%;
	background: none;
	border: none;
	cursor: pointer;
	font-size: 18px;
	padding: 0 12px 0 6px;
	border-radius: 7px;
}

.menu-btn:hover {
	color: var(--secondary-color);
}

.menu-btn.favorite {
	font-size: 15px;
	padding: 0 6px 0 12px;
}

.context-menu {
	position: absolute;
	bottom: 22px;
	right: 12px;
	border-radius: 6px;
	background: var(--neutral-color);
	box-shadow: 0 4px 8px var(--body-bg);
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
	padding: 4px 12px;
	text-align: left;
	cursor: pointer;
	font-size: 12px;
	transition: background-color 0.2s;
}

.context-menu button:hover {
	background-color: var(--primary-color);
}

.context-menu button.danger {
	border-bottom: 1px solid var(--neutral-hover);
}

.context-menu button.danger:hover {
	background-color: var(--danger-color);
}
</style>
