export type WindowChannelAction = 'minimize' | 'close';

export type FilesInvokeAction = 'image' | 'video' | 'webpage' | 'folder' | 'stickers' | 'create' | 'get-url';

export type FilesContentResponse = { filename: string; path: string; error?: string };

export type FilesResponse = { error?: string; path?: string; content?: FilesContentResponse[] };
