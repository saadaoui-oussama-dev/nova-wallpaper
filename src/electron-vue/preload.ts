import { DatabaseChannel, FilesChannel, JSONChannel, WindowChannel } from '@/types/channels';

type NovaWallpaperPreload = {
	window: WindowChannel;
	json: JSONChannel;
	database: DatabaseChannel;
	files: FilesChannel;
};

export const NovaWallpaper: NovaWallpaperPreload = new Proxy<NovaWallpaperPreload>({} as NovaWallpaperPreload, {
	get(target: NovaWallpaperPreload, prop: 'window' | 'files' | 'json' | 'database') {
		if (prop in target) return target[prop];
		else if ('NovaWallpaper' in window) {
			Object.assign(NovaWallpaper, window.NovaWallpaper);
			return (window.NovaWallpaper as NovaWallpaperPreload)[prop];
		}
	},
});
