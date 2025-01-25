export type WindowSendAction = 'minimize' | 'close';

export type WindowInvokeAction = 'get-areas';

export type WindowResponse = {
	fullscreen: { width: number; height: number };
	workarea: { width: number; height: number };
	taskbar: { width: number; height: number };
};

export type FilesInvokeAction = 'image' | 'video' | 'webpage' | 'folder' | 'stickers' | 'create' | 'get-url';

export type FilesContentResponse = { filename: string; path: string; error?: string };

export type FilesResponse = { error?: string; path?: string; content?: FilesContentResponse[] };
