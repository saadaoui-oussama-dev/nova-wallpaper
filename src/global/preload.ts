import eventsBus from '@/global/events';

type ChannelConnector = {
	on: (event: string, callback: (...data: any[]) => void) => void;
	off: (event: string) => void;
	send: (key: string, ...data: any[]) => void;
	invoke: <T = any>(key: string, ...data: any[]) => Promise<T>;
};

type NovaWallpaperPreload = {
	dashboard: ChannelConnector;
};

export const NovaWallpaper: NovaWallpaperPreload = {} as NovaWallpaperPreload;

export function setPreloadListener() {
	eventsBus.$on('nova-wallpaper-preload', (preload: NovaWallpaperPreload) => {
		Object.assign(NovaWallpaper, preload);
	});
}
