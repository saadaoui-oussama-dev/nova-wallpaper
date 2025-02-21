import { readFileSync } from 'fs';
import { ipcMain } from 'electron';
import { database } from '@/global/database';
import { readJson, writeJSON } from '@/global/json';
import { getFileType, isSupported, events, fileSizeChecker, getAreas } from '@/global/utils';
import { Send, Invoke, Response, WindowChannel, JSONChannel, DatabaseChannel, FilesChannel } from '@/types/channels';
import { dashboardFilesListener } from '@/dashboard';

export const startVueEventsListeners = () => {
	ipcMain.on('vue-window', (_, action: Send<WindowChannel>): void => {
		if (action.includes('dashboard')) events.$emit('dashboard-window', action);
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

	ipcMain.handle('vue-files', async (_, action: Invoke<FilesChannel>, path?: string, onlyFolder?: boolean) => {
		return new Promise((resolve: (v: Response<FilesChannel>) => void) => {
			if (action === 'get-url' && path) {
				if (!isSupported(path)) return resolve({ error: 'Unsupported file type.' });
				const error = fileSizeChecker(path);
				if (error) return resolve({ error });
				return resolve({ path: `data:${getFileType(path).mime};base64,${readFileSync(path).toString('base64')}` });
			}
			dashboardFilesListener(action, !!onlyFolder, resolve);
		});
	});
};
