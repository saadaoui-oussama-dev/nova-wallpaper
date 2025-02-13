// Channels Creator & Parts Detectors

type Channel<Send extends string, Invoke extends string, Response = void> = {
	on: (event: string, callback: (...data: any[]) => void) => void;
	off: (event: string) => void;
	send: (key: Send, ...data: any[]) => void;
	invoke: (key: Invoke, ...data: any[]) => Promise<Response>;
};

export type Send<T> = T extends Channel<infer R, any, any> ? R : never;

export type Invoke<T> = T extends Channel<any, infer R, any> ? R : never;

export type Response<T> = T extends Channel<any, any, infer R> ? R : never;

export type AsyncResponse<T> = Promise<Response<T>>;

// Dashboard Channels

export type WindowChannel = Channel<
	'minimize' | 'close',
	'get-areas',
	{
		fullscreen: { width: number; height: number };
		workarea: { width: number; height: number };
		taskbar: { width: number; height: number };
	}
>;

export type JSONChannel = Channel<
	'throw-error' | 'send-is-not-supported',
	'read' | 'write',
	{ exist: boolean; valid: boolean; data: any }
>;

export type DatabaseChannel = Channel<
	'throw-error' | 'send-is-not-supported',
	'read' | 'insert' | 'update',
	{ doc: any; error: string }
>;

export type FilesChannel = Channel<
	'throw-error' | 'send-is-not-supported',
	'media' | 'webpage' | 'folder' | 'stickers' | 'create' | 'executable' | 'get-url',
	{ error?: string; path?: string; content?: { filename: string; path: string; error?: string }[] }
>;
