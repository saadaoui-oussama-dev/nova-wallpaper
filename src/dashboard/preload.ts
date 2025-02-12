import { ChannelConnector, SendActionNotSupported } from '@/types/channels';
import { DatabaseInvokeAction, DatabaseResponse } from '@/types/channels';
import { FilesInvokeAction, FilesResponse } from '@/types/channels';
import { JSONInvokeAction, JSONResponse } from '@/types/channels';
import { WindowSendAction, WindowInvokeAction, WindowResponse } from '@/types/channels';

type NovaWallpaperPreload = {
	database: ChannelConnector<SendActionNotSupported, DatabaseInvokeAction, DatabaseResponse>;
	files: ChannelConnector<SendActionNotSupported, FilesInvokeAction, FilesResponse>;
	json: ChannelConnector<SendActionNotSupported, JSONInvokeAction, JSONResponse>;
	window: ChannelConnector<WindowSendAction, WindowInvokeAction, WindowResponse>;
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
