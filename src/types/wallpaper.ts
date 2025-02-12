export type WallpaperType = 'image' | 'video' | 'webpage' | 'folder' | 'stickers';

export type SimpleMap = Record<string, string | number | boolean>;

export type FolderItem = { filename: string; path: string; error?: string };

export type Wallpaper = {
	id: string;
	label: string;
	type: WallpaperType;
	path: string;
	content: FolderItem[];
	favorite: boolean;
	taskbar: boolean;
	settings: SimpleMap;
	permissions: SimpleMap;
	queryParams: SimpleMap;
};
