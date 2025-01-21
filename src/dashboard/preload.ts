type ChannelConnector = {
	on: (event: string, callback: (...data: any[]) => void) => void;
	off: (event: string) => void;
	send: (key: string, ...data: any[]) => void;
	invoke: <T = any>(key: string, ...data: any[]) => Promise<T>;
};

type NovaWallpaperPreload = {
	dashboard: ChannelConnector;
};

export const NovaWallpaper: NovaWallpaperPreload = new Proxy<NovaWallpaperPreload>({} as NovaWallpaperPreload, {
	get(target: any, prop: string) {
		if (prop in target) return target[prop];
		else if ('NovaWallpaper' in window) {
			Object.assign(NovaWallpaper, window.NovaWallpaper);
			return (window.NovaWallpaper as any)[prop];
		}
	},
});
