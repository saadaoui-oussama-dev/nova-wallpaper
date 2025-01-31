export type WindowSendAction = 'minimize' | 'close';

export type WindowInvokeAction = 'get-areas';

export type WindowResponse = {
	fullscreen: { width: number; height: number };
	workarea: { width: number; height: number };
	taskbar: { width: number; height: number };
};

export type FilesInvokeAction =
	| 'image'
	| 'video'
	| 'webpage'
	| 'folder'
	| 'stickers'
	| 'create'
	| 'executable'
	| 'get-url';

export type FilesContentResponse = { filename: string; path: string; error?: string };

export type FilesResponse = { error?: string; path?: string; content?: FilesContentResponse[] };

export type JSONInvokeAction = 'read' | 'write';

export type JSONResponse = { exist: boolean; valid: boolean; data: any };

export type DatabaseInvokeAction = 'read' | 'insert';

export type DatabaseResponse = { doc: any; error: string };
