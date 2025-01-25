import * as Channels from '@/global/channel-types';

type SendActionNotSupported = 'throw-error' | 'send-is-not-supported';
type InvokeActionNotSupported = 'throw-error' | 'invoke-is-not-supported';

type ChannelConnector<SendAction, ReceiveAction, ReceiveResponse> = {
	on: (event: string, callback: (...data: any[]) => void) => void;
	off: (event: string) => void;
	send: (key: SendAction, ...data: any[]) => void;
	invoke: (key: ReceiveAction, ...data: any[]) => Promise<ReceiveResponse>;
};

type NovaWallpaperPreload = {
	window: ChannelConnector<Channels.WindowSendAction, Channels.WindowInvokeAction, Channels.WindowResponse>;
	files: ChannelConnector<SendActionNotSupported, Channels.FilesInvokeAction, Channels.FilesResponse>;
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
