export type DashboardChannelAction = 'minimize' | 'close';

export type FileChannelAction = 'image' | 'video' | 'webpage' | 'folder' | 'stickers' | 'create' | 'get-url';

export type FileChannelContentResponse = { filename: string; path: string; error?: string };

export type FileChannelResponse = { error?: string; path?: string; content?: FileChannelContentResponse[] };
