export type SimpleRecord = Record<string, string | number | boolean>;

export type FolderItem = { filename: string; path: string; error?: string };

export type Wallpaper = {
	id: number;
	label: string;
	path: string;
	favorite: boolean;
	taskbar: boolean;
	settings: SimpleRecord;
	permissions: SimpleRecord;
	queries: SimpleRecord;
	content: FolderItem[];
};
