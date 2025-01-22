import { defineStore } from 'pinia';

export interface State {
	settings: {
		font: 'standard' | 'handwritten';
	};
}

export const useWallpaperStore = defineStore('wallpaper', {
	state: (): State => ({
		settings: {
			font: 'standard',
		},
	}),

	actions: {
		updateSettings(newSettings: Partial<State['settings']>) {
			this.settings = { ...this.settings, ...newSettings };
		},
	},
});
