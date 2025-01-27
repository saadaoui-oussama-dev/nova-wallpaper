const { readdirSync, readFileSync } = require('fs');
import { join } from 'path';
import { dialog, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { events, getFileType, isSupported, fileSizeChecker, joinPublic, getAreas } from '@/global/electron-utils';
import { readJson, writeJSON } from '@/global/json';
import * as Channels from '@/global/channel-types';

let dashboard: BrowserWindow | undefined;

export const openDashboard = async () => {
	if (dashboard) return dashboard.focus();

	dashboard = new BrowserWindow({
		width: 500,
		height: 750,
		frame: false,
		show: false,
		transparent: true,
		resizable: false,
		title: 'Nova Wallpaper',
		icon: joinPublic('@/public/imgs/logo.png'),
		webPreferences: {
			devTools: false,
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true,
			preload: joinPublic('@/public/scripts/preload.js'),
		},
	});

	dashboard.focus();
	dashboard.on('close', () => (dashboard = undefined));
	try {
		if (process.env.WEBPACK_DEV_SERVER_URL) {
			await dashboard.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
		} else {
			createProtocol('app');
			await dashboard.loadURL('app://./index.html');
		}
		dashboard.show();
	} catch {
		return events.$emit('dashboard', 'close');
	}
};

events.$on('dashboard', (action: string) => {
	if (!dashboard) return;
	if (action === 'focus') return dashboard.focus();
	if (action === 'minimize') return dashboard.minimize();
	if (action === 'close') {
		dashboard.destroy();
		dashboard = undefined;
	}
});

ipcMain.on('window', (_, key: Channels.WindowSendAction) => {
	if (['close', 'minimize'].includes(key)) return events.$emit('dashboard', key);
});

ipcMain.handle('window', (_, key: Channels.WindowInvokeAction) => {
	if (key === 'get-areas') return getAreas();
});

ipcMain.handle(
	'json',
	(_, key: Channels.JSONInvokeAction, filename: string, dataOrIsArray?: any): Channels.JSONResponse => {
		if (key === 'read') return readJson(filename, dataOrIsArray);
		else if (key === 'write') return writeJSON(filename, dataOrIsArray);
		return { exist: false, valid: false, data: null };
	}
);

ipcMain.handle('files', async (_, action: Channels.FilesInvokeAction, path?: string) => {
	return new Promise<Channels.FilesResponse>((resolve) => {
		if (action === 'get-url' && path) {
			if (!isSupported(path)) return resolve({ error: 'Unsupported file type.' });
			const error = fileSizeChecker(path);
			if (error) return resolve({ error });
			return resolve({ path: `data:${getFileType(path).mime};base64,${readFileSync(path).toString('base64')}` });
		}

		const openFile = (name: string, extensions: string[]) => {
			if (!dashboard) return;
			dialog.showOpenDialog(dashboard, { properties: ['openFile'], filters: [{ name, extensions }] }).then((result) => {
				if (result.canceled || !result.filePaths.length) return resolve({ error: 'Canceled' });
				const absolutePath = result.filePaths[0];
				if (!isSupported(absolutePath)) return resolve({ error: 'Unsupported file type.' });
				const error = fileSizeChecker(absolutePath);
				resolve(error ? { error } : { path: absolutePath, content: [] });
			});
		};

		const openDirectory = () => {
			if (!dashboard) return;
			dialog.showOpenDialog(dashboard, { properties: ['openDirectory'] }).then((result) => {
				if (result.canceled || !result.filePaths.length) return resolve({ error: 'Canceled' });
				const folderPath = result.filePaths[0];

				const content: Channels.FilesContentResponse[] = readdirSync(folderPath)
					.map((filename: string): Channels.FilesContentResponse | undefined => {
						if (!isSupported(filename, true)) return;
						const absolutePath = join(folderPath, filename);
						const error = fileSizeChecker(absolutePath);
						return error ? { filename, path: absolutePath, error } : { filename, path: absolutePath };
					})
					.filter(Boolean);
				resolve(content.length ? { path: folderPath, content } : { error: 'The folder is empty.' });
			});
		};

		if (action === 'image') return openFile('Images', ['png', 'jpg', 'jpeg']);
		if (action === 'video') return openFile('Videos', ['mp4']);
		if (action === 'webpage') return openFile('Webpages', ['html']);
		if (action === 'folder') return openDirectory();
		resolve({ error: `${action}: This action is not supported` });
	});
});
