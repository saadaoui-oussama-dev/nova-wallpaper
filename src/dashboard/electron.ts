const { readdirSync, readFileSync } = require('fs');
import { join } from 'path';
import { dialog, BrowserWindow, ipcMain } from 'electron';
import { database } from '@/global/database';
import { readJson, writeJSON } from '@/global/json';
import { getFileType, isSupported } from '@/global/files';
import { events, fileSizeChecker, getAreas, VueBrowserWindow, loadVueApp } from '@/global/utils';
import { Send, Invoke, Response, WindowChannel, JSONChannel, DatabaseChannel, FilesChannel } from '@/types/channels';

let dashboard: BrowserWindow | null;

let splashscreen: BrowserWindow | null;

let firstOpen = true;

export const openDashboard = async () => {
	if (dashboard) {
		dashboard.show();
		return dashboard.focus();
	}

	dashboard = VueBrowserWindow(() => (dashboard = null), {
		title: 'Nova Wallpaper',
		width: 1020,
		height: 770,
		minWidth: 500,
		minHeight: 770,
		frame: false,
		resizable: true,
		fullscreenable: false,
	});

	dashboard.webContents.openDevTools();
	dashboard.focus();

	splashscreen = VueBrowserWindow(() => (splashscreen = null), {
		title: 'Nova Wallpaper Splashscreen',
		width: 180,
		height: 180,
		frame: false,
		alwaysOnTop: true,
		transparent: true,
		skipTaskbar: true,
		resizable: false,
		hasShadow: false,
	});

	const onload = async () => {
		if (dashboard) await loadVueApp(dashboard, 'main=true', false);
		if (splashscreen) await loadVueApp(splashscreen, 'splashscreen=true');
	};

	if (!firstOpen) return onload();
	firstOpen = false;

	events.$on('dashboard-window', (action: Send<WindowChannel> | 'focus') => {
		if (action === 'focus' && dashboard) {
			dashboard.show();
			return dashboard.focus();
		} else if (action === 'minimize' && dashboard) {
			return dashboard.minimize();
		} else if (action === 'is-maximized') {
			const isMax = dashboard ? dashboard.isMaximized() : false;
			if (dashboard) dashboard.webContents.send('is-maximized', 'window', isMax);
		} else if (action === 'maximize' && dashboard) {
			return dashboard.isMaximized() ? dashboard.unmaximize() : dashboard.maximize();
		} else if (action === 'close') {
			if (dashboard) dashboard.destroy();
			dashboard = null;
		} else if (action === 'close-splashscreen') {
			if (splashscreen) splashscreen.destroy();
			if (dashboard) dashboard.show();
			splashscreen = null;
		}
	});

	events.$on('dashboard-active-changed', () => {
		if (dashboard) dashboard.webContents.send('refresh', 'database');
	});

	ipcMain.on('dashboard-window', (_, action: Send<WindowChannel>): void => {
		events.$emit('dashboard-window', action);
	});

	ipcMain.handle('dashboard-window', (_, action: Invoke<WindowChannel>) => {
		return new Promise<Response<WindowChannel>>((resolve) => {
			const def = { width: 0, height: 0 };
			if (action === 'get-areas') return resolve(getAreas());
			else resolve({ fullscreen: def, workarea: def, taskbar: def });
		});
	});

	ipcMain.handle('dashboard-json', (_, action: Invoke<JSONChannel>, filename: string, dataOrIsArray?: any) => {
		return new Promise<Response<JSONChannel>>((resolve) => {
			if (action === 'read') resolve(readJson(filename, dataOrIsArray));
			else if (action === 'write') resolve(writeJSON(filename, dataOrIsArray));
			else resolve({ exist: false, valid: false, data: null });
		});
	});

	ipcMain.handle(
		'dashboard-database',
		(_, action: Invoke<DatabaseChannel>, table: string, payload: { [key: string]: any }) => {
			return new Promise<Response<DatabaseChannel>>(async (resolve) => {
				if (action === 'read') return resolve(database.read(table, payload));
				else if (action === 'insert') return resolve(database.insert(table, payload));
				else if (action === 'update') {
					const response = database.update(table, payload);
					if (response.error) return resolve(response);
					if (table === 'active' || ['favorite', 'label'].some((a) => a in payload)) {
						events.$emit('tray-reload-menu');
						if (table === 'active') events.$emit('renderer-sync-action', 'change');
					} else if (['settings', 'queryParams', 'permissions', 'taskbar', 'content'].some((a) => a in payload)) {
						events.$emit('renderer-sync-action', 'change');
					}
					return resolve(response);
				} else if (action === 'delete') {
					const response = database.delete(table, payload);
					if (response.error) return resolve(response);
					events.$emit('tray-reload-menu');
					events.$emit('renderer-sync-action', 'change');
					return resolve(response);
				}
				return resolve({ doc: null, error: `${action}: This action is not supported` });
			});
		}
	);

	ipcMain.handle('dashboard-files', async (_, action: Invoke<FilesChannel>, path?: string, onlyFolder?: boolean) => {
		return new Promise<Response<FilesChannel>>((resolve) => {
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

					const content = readdirSync(folderPath)
						.map((filename: string) => {
							if (!isSupported(filename, true)) return;
							const absolutePath = join(folderPath, filename);
							const error = fileSizeChecker(absolutePath);
							return error ? { filename, path: absolutePath, error } : { filename, path: absolutePath };
						})
						.filter(Boolean);
					resolve(content.length ? { path: folderPath, content } : { error: 'The folder is empty.' });
				});
			};

			if (action === 'media') return openFile('Media', ['png', 'jpg', 'jpeg', 'mp4', 'gif']);
			if (action === 'webpage') return openFile('Webpage', ['html']);
			if (action === 'executable') return openFile('Program File', ['exe']);
			if (action === 'folder') return openDirectory();
			resolve({ error: `${action}: This action is not supported` });
		});
	});

	onload();
};
