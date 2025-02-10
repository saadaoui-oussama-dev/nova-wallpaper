import * as Channels from '@/dashboard/channels';

type SendActionNotSupported = 'throw-error' | 'send-is-not-supported';

type ChannelConnector<SendAction, ReceiveAction, ReceiveResponse> = {
	on: (event: string, callback: (...data: any[]) => void) => void;
	off: (event: string) => void;
	send: (key: SendAction, ...data: any[]) => void;
	invoke: (key: ReceiveAction, ...data: any[]) => Promise<ReceiveResponse>;
};

type NovaWallpaperPreload = {
	window: ChannelConnector<Channels.WindowSendAction, Channels.WindowInvokeAction, Channels.WindowResponse>;
	files: ChannelConnector<SendActionNotSupported, Channels.FilesInvokeAction, Channels.FilesResponse>;
	json: ChannelConnector<SendActionNotSupported, Channels.JSONInvokeAction, Channels.JSONResponse>;
	database: ChannelConnector<SendActionNotSupported, Channels.DatabaseInvokeAction, Channels.DatabaseResponse>;
	log: (...data: any[]) => void;
};

export const NovaWallpaper: NovaWallpaperPreload = new Proxy<NovaWallpaperPreload>({} as NovaWallpaperPreload, {
	get(target: NovaWallpaperPreload, prop: 'window' | 'files' | 'json' | 'database' | 'log') {
		if (prop in target) return target[prop];
		else if ('NovaWallpaper' in window) {
			Object.assign(NovaWallpaper, window.NovaWallpaper);
			return (window.NovaWallpaper as NovaWallpaperPreload)[prop];
		}
	},
});
