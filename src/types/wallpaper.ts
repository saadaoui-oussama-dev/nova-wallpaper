export type SimpleMap = Record<string, string | number | boolean>;

export type FolderItem = { filename: string; path: string; error?: string };

export type Wallpaper = {
	id: number;
	label: string;
	path: string;
	content: FolderItem[];
	favorite: boolean;
	taskbar: boolean;
	settings: SimpleMap;
	permissions: SimpleMap;
	queryParams: SimpleMap;
};
