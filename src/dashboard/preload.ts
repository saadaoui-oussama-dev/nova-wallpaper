import { DashboardChannelAction, FileChannelAction, FileChannelResponse } from '@/global/channel-types';

type ChannelConnector<SendAction, ReceiveAction, ReceiveResponse> = {
	on: (event: string, callback: (...data: any[]) => void) => void;
	off: (event: string) => void;
	send: (key: SendAction, ...data: any[]) => void;
	invoke: (key: ReceiveAction, ...data: any[]) => Promise<ReceiveResponse>;
};

type NovaWallpaperPreload = {
	dashboard: ChannelConnector<DashboardChannelAction, 'throw-error', Error>;
	files: ChannelConnector<'throw-error', FileChannelAction, FileChannelResponse>;
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
