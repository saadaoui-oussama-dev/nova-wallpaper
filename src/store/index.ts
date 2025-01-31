import { defineStore } from 'pinia';
import { FilesContentResponse } from '@/global/channel-types';

export type Wallpaper = {
	id: string;
	label: string;
	type: 'image' | 'video' | 'webpage' | 'folder' | 'stickers';
	path: string;
	content: FilesContentResponse[];
	settings: { [key: string]: string | number | boolean };
};

export interface State {
	settings: Settings;
	currentImporting: Wallpaper | null;
}

export const useWallpaperStore = defineStore('wallpaper', {
	state: (): State => ({
		settings: { font: 'standard' },
		currentImporting: null,
	}),

	actions: {
		prepareToAddWallpaper(wallpaper: Wallpaper) {
			this.currentImporting = wallpaper;
		},

		cancelImporting() {
			this.currentImporting = null;
		},
	},
});
