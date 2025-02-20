const { app, screen, BrowserWindow } = require('electron');
const { join } = require('path');
const { statSync } = require('fs');
import { SimpleMap } from '@/types/wallpaper';
import { Response, WindowChannel } from '@/types/channels';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

export * from '@/global/events';

export * from '@/global/files';

export const VueBrowserWindow = (onClose?: () => void, options?: Electron.BrowserWindowConstructorOptions) => {
	const { width, height } = getAreas().workarea;
	const window = new BrowserWindow({
		show: false,
		icon: joinPublic('@/public/img/logo.png'),
		webPreferences: {
			devTools: false,
			nodeIntegration: false,
			contextIsolation: true,
			preload: joinPublic('@/public/js/dashboard-preload.js'),
		},
		...options,
		width: Math.min(options ? options.width || width : width, width),
		height: Math.min(options ? options.height || height : height, height),
		minWidth: Math.min(options ? options.minWidth || options.width || width : width, width),
		minHeight: Math.min(options ? options.minHeight || options.height || height : height, height),
	});
	window.on('close', () => onClose && onClose());
	return window;
};

export const loadVueApp = async (window: Electron.BrowserWindow, query?: string, show = true) => {
	try {
		if (process.env.WEBPACK_DEV_SERVER_URL) {
			await window.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}?${query || ''}`);
		} else {
			createProtocol('app');
			await window.loadURL(`app://./index.html/?${query || ''}`);
		}
		if (show) window.show();
		return true;
	} catch {
		return false;
	}
};

export const joinPublic = (path: string): string => {
	return join(__dirname, path.replace('@/public', app.isPackaged ? '' : '../public'));
};

export const fileSizeChecker = (filePath: string): string => {
	try {
		return statSync(filePath).size <= 40 * 1024 * 1024 ? '' : 'File exceeds the 40MB limit.';
	} catch {
		return 'Unable to access the file.';
	}
};

export const getAreas = (): Response<WindowChannel> => {
	const $screen = screen.getPrimaryDisplay();
	const { width: fw, height: fh } = $screen.size;
	let { width: ww, height: wh } = $screen.workAreaSize;
	if (fw > ww) ww += 1;
	if (fh > wh) wh += 1;
	const taskbar = { width: fw - ww, height: fh - wh };
	return { fullscreen: { width: fw, height: fh }, workarea: { width: ww, height: wh }, taskbar };
};

const threads: { [key: string]: { current: Promise<void> | null; next: boolean } } = {};

export const threadsManager = async (key: string, callback: () => Promise<void>) => {
	if (!threads[key]) threads[key] = { current: null, next: false };
	if (threads[key].current) {
		if (threads[key].next) return;
		threads[key].next = true;
		await threads[key].current;
		threads[key].next = false;
	}
	let resolveThread = () => console.log();
	threads[key].current = new Promise((resolve) => (resolveThread = resolve));
	await callback();
	resolveThread();
};

export const compareMaps = (data1: SimpleMap, data2: SimpleMap, onlyKeys = false): boolean => {
	const data1keys = Object.keys(data1);
	if (data1keys.length !== Object.keys(data2).length) return false;
	return data1keys.every((k) => k in data2 && (onlyKeys || data1[k] === data2[k]));
};

export const getMapChanges = (data1?: SimpleMap, data2?: SimpleMap) => {
	return data1 && data2 ? Object.entries(data1).filter(([id, val]) => data2[id] !== val) : Object.entries(data1 || {});
};
