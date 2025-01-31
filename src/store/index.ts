import { defineStore } from 'pinia';
import { FilesContentResponse } from '@/global/channel-types';

export type WallpaperType = 'image' | 'video' | 'webpage' | 'folder' | 'stickers';

export type Settings = { [key: string]: string | number | boolean };

export type Permission = { type: 'executable' | 'url' | 'folder'; name: string; label: string; value: string };

export type Query = { key: string; value: string };

export type Wallpaper = {
	id: string;
	label: string;
	type: WallpaperType;
	path: string;
	content: FilesContentResponse[];
	taskbar: boolean;
	settings: Settings;
	permissions: Permission[];
	queryParams: Query[];
};

export interface State {
	formWallpaper: Wallpaper | null;
}

export const useWallpaperStore = defineStore('wallpaper', {
	state: (): State => ({
		formWallpaper: null,
	}),

	actions: {
		prepareToAddWallpaper(type: WallpaperType, path: string, content: FilesContentResponse[]) {
			this.formWallpaper = {
				id: '',
				label: '',
				type,
				path,
				content,
				taskbar: false,
				settings: {},
				permissions: [],
				queryParams: [],
			};
		},

		discardAdding() {
			this.formWallpaper = null;
		},

		addWallpaper(wallpaper: Wallpaper) {
			console.log(wallpaper);
		},
	},
});
