import { ChannelConnector, SendActionNotSupported } from '@/types/channels';
import * as Channels from '@/types/channels';

type NovaWallpaperPreload = {
	window: ChannelConnector<Channels.WindowSendAction, Channels.WindowInvokeAction, Channels.WindowResponse>;
	files: ChannelConnector<SendActionNotSupported, Channels.FilesInvokeAction, Channels.FilesResponse>;
	json: ChannelConnector<SendActionNotSupported, Channels.JSONInvokeAction, Channels.JSONResponse>;
	database: ChannelConnector<SendActionNotSupported, Channels.DatabaseInvokeAction, Channels.DatabaseResponse>;
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
