const { readdirSync, readFileSync } = require('fs');
import { join } from 'path';
import { dialog, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { events, getFileType, isSupported, fileSizeChecker, joinPublic, getAreas } from '@/global/electron-utils';
import { readJson, writeJSON } from '@/global/json';
import { database } from '@/global/database';
import * as Channels from '@/types/channels';

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
		icon: joinPublic('@/public/img/logo.png'),
		webPreferences: {
			devTools: false,
			nodeIntegration: false,
			contextIsolation: true,
			preload: joinPublic('@/public/js/dashboard-preload.js'),
		},
	});

	dashboard.focus();
	dashboard.on('close', () => (dashboard = undefined));

	events.$on('dashboard-window', (action: string) => {
		if (!dashboard) return;
		if (action === 'focus') return dashboard.focus();
		if (action === 'minimize') return dashboard.minimize();
		if (action === 'close') {
			dashboard.destroy();
			dashboard = undefined;
		}
	});

	events.$on('dashboard-active-changed', () => {
		if (dashboard) dashboard.webContents.send('refresh', 'database');
		setTimeout(() => events.$emit('dashboard-window', 'minimize'), 400);
	});

	ipcMain.on('dashboard-window', (_, action: Channels.WindowSendAction) => {
		if (['close', 'minimize'].includes(action)) return events.$emit('dashboard-window', action);
	});

	ipcMain.handle('dashboard-window', (_, action: Channels.WindowInvokeAction) => {
		if (action === 'get-areas') return getAreas();
	});

	ipcMain.handle('dashboard-json', (_, action: Channels.JSONInvokeAction, filename: string, dataOrIsArray?: any) => {
		return new Promise<Channels.JSONResponse>((resolve) => {
			if (action === 'read') resolve(readJson(filename, dataOrIsArray));
			else if (action === 'write') resolve(writeJSON(filename, dataOrIsArray));
			else resolve({ exist: false, valid: false, data: null });
		});
	});

	ipcMain.handle(
		'dashboard-database',
		(_, action: Channels.DatabaseInvokeAction, table: string, dataOrFilters: { [key: string]: any }) => {
			return new Promise<Channels.DatabaseResponse>(async (resolve) => {
				if (action === 'read') return resolve(database.read(table, dataOrFilters));
				if (action === 'insert') return resolve(database.insert(table, dataOrFilters));
				if (action === 'update') {
					const response = await database.update(table, dataOrFilters);
					if (!response.error && (table === 'active' || (table === 'wallpaper' && 'favorite' in dataOrFilters)))
						events.$emit('tray-reload-menu');
					resolve(response);
					return;
				}
				return resolve({ doc: null, error: `${action}: This action is not supported` });
			});
		}
	);

	ipcMain.handle(
		'dashboard-files',
		async (_, action: Channels.FilesInvokeAction, path?: string, onlyFolder?: boolean) => {
			return new Promise<Channels.FilesResponse>((resolve) => {
				if (action === 'get-url' && path) {
					if (!isSupported(path)) return resolve({ error: 'Unsupported file type.' });
					const error = fileSizeChecker(path);
					if (error) return resolve({ error });
					return resolve({ path: `data:${getFileType(path).mime};base64,${readFileSync(path).toString('base64')}` });
				}

				const openFile = (name: string, extensions: string[]) => {
					if (!dashboard) return;
					dialog
						.showOpenDialog(dashboard, { properties: ['openFile'], filters: [{ name, extensions }] })
						.then((result) => {
							if (result.canceled || !result.filePaths.length) return resolve({ error: 'Canceled' });
							const absolutePath = result.filePaths[0];
							if (action === 'executable') return resolve({ path: absolutePath, content: [] });
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
						if (onlyFolder) return resolve({ path: folderPath, content: [] });

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

				if (action === 'media') return openFile('Media', ['png', 'jpg', 'jpeg', 'mp4']);
				if (action === 'webpage') return openFile('Webpage', ['html']);
				if (action === 'executable') return openFile('Program File', ['exe']);
				if (action === 'folder') return openDirectory();
				resolve({ error: `${action}: This action is not supported` });
			});
		}
	);

	try {
		if (process.env.WEBPACK_DEV_SERVER_URL) {
			await dashboard.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
		} else {
			createProtocol('app');
			await dashboard.loadURL('app://./index.html');
		}
		dashboard.show();
	} catch {
		return events.$emit('dashboard-window', 'close');
	}
};
