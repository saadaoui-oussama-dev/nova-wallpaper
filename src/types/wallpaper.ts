import { FilesContentResponse } from '@/types/channels';

export type WallpaperType = 'image' | 'video' | 'webpage' | 'folder' | 'stickers';

export type SimpleMap = Record<string, string | number | boolean>;

export type Wallpaper = {
	id: string;
	label: string;
	type: WallpaperType;
	path: string;
	content: FilesContentResponse[];
	favorite: boolean;
	taskbar: boolean;
	settings: SimpleMap;
	permissions: SimpleMap;
	queryParams: SimpleMap;
};
