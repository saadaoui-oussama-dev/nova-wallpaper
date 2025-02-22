import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { BrowserWindow, ipcMain, dialog } from 'electron';
import { database } from '@/global/database';
import { readJson, writeJSON } from '@/global/json';
import { getFileType, isSupported, events, fileSizeChecker, getAreas } from '@/global/utils';
import { Send, Invoke, Response, WindowChannel, JSONChannel, DatabaseChannel, FilesChannel } from '@/types/channels';

export const startVueEventsListeners = () => {
	ipcMain.on('vue-window', (_, action: Send<WindowChannel>): void => {
		if (action.includes('library')) events.$emit('library-window', action);
		else if (action.includes('form')) events.$emit('form-window', action);
	});

	ipcMain.handle('vue-window', (_, action: Invoke<WindowChannel>) => {
		return new Promise<Response<WindowChannel>>((resolve) => {
			const def = { width: 0, height: 0 };
			if (action === 'get-areas') return resolve(getAreas());
			else resolve({ fullscreen: def, workarea: def, taskbar: def });
		});
	});

	ipcMain.handle('vue-json', (_, action: Invoke<JSONChannel>, filename: string, dataOrIsArray?: any) => {
		return new Promise<Response<JSONChannel>>((resolve) => {
			if (action === 'read') resolve(readJson(filename, dataOrIsArray));
			else if (action === 'write') resolve(writeJSON(filename, dataOrIsArray));
			else resolve({ exist: false, valid: false, data: null });
		});
	});

	ipcMain.handle(
		'vue-database',
		(_, action: Invoke<DatabaseChannel>, table: string, payload: { [key: string]: any }, trigger: string) => {
			return new Promise<Response<DatabaseChannel>>(async (resolve) => {
				if (action === 'read') return resolve(database.read(table, payload));
				else if (action === 'insert') return resolve(database.insert(table, payload));
				else if (action === 'update') {
					const response = database.update(table, payload);
					if (response.error) return resolve(response);
					if (table === 'active' || 'favorite' in payload) {
						events.$emit('tray-reload-menu');
						if (table === 'active') events.$emit('active-wallpaper-changed', 'library');
						if (table === 'active') events.$emit('renderer-sync-action', 'change');
					} else if ('label' in payload) {
						events.$emit('tray-reload-menu');
						events.$emit('active-wallpaper-changed', 'form');
					} else if (['settings', 'permissions', 'queries', 'taskbar', 'content'].some((prop) => prop in payload)) {
						events.$emit('renderer-sync-action', 'change');
						events.$emit('active-wallpaper-changed', 'form');
					}
					return resolve(response);
				} else if (action === 'delete') {
					const response = database.delete(table, payload);
					if (response.error) return resolve(response);
					events.$emit('tray-reload-menu');
					events.$emit('active-wallpaper-changed', trigger);
					events.$emit('renderer-sync-action', 'change');
					return resolve(response);
				}
				return resolve({ doc: null, error: `${action}: This action is not supported` });
			});
		}
	);

	ipcMain.handle('vue-files', async (event, action: Invoke<FilesChannel>, path?: string, onlyFolder?: boolean) => {
		const win = BrowserWindow.fromWebContents(event.sender);

		return new Promise((resolve: (v: Response<FilesChannel>) => void) => {
			if (action === 'get-url' && path) {
				if (!isSupported(path)) return resolve({ error: 'Unsupported file type.' });
				const error = fileSizeChecker(path);
				if (error) return resolve({ error });
				return resolve({ path: `data:${getFileType(path).mime};base64,${readFileSync(path).toString('base64')}` });
			}

			const openFile = (name: string, extensions: string[]) => {
				if (!win) return;
				dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name, extensions }] }).then((result) => {
					if (result.canceled || !result.filePaths.length) return resolve({ error: 'Canceled' });
					const absolutePath = result.filePaths[0];
					if (action === 'executable') return resolve({ path: absolutePath, content: [] });
					if (!isSupported(absolutePath)) return resolve({ error: 'Unsupported file type.' });
					const error = fileSizeChecker(absolutePath);
					resolve(error ? { error } : { path: absolutePath, content: [] });
				});
			};

			const openDirectory = () => {
				if (!win) return;
				dialog.showOpenDialog(win, { properties: ['openDirectory'] }).then((result) => {
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
						.filter((file) => file !== undefined);
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
};
