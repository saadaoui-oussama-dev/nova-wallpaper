import { defineStore } from 'pinia';

export type Settings = {
	font: 'standard' | 'handwritten';
};

export type Wallpaper = {
	id: string;
	label: string;
	type: 'image' | 'video' | 'webpage' | 'folder' | 'stickers';
	path: string;
	settings: any;
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
		updateSettings(newSettings: Partial<Settings>) {
			this.settings = { ...this.settings, ...newSettings };
		},

		prepareToAddWallpaper(wallpaper: Wallpaper) {
			this.currentImporting = wallpaper;
		},

		cancelImporting() {
			this.currentImporting = null;
		},
	},
});
