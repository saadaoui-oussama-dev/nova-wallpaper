import { join } from 'path';
import { readdirSync } from 'fs';
import { dialog, BrowserWindow } from 'electron';
import { VueApp, loadVueApp, destroyVueApp } from '@/electron-vue/load-app';
import { isSupported, events, fileSizeChecker } from '@/global/utils';
import { Invoke, Response, FilesChannel } from '@/types/channels';

let dashboard: BrowserWindow | null;

let splashscreen: BrowserWindow | null;

export const initDashboard = () => {
	events.$on('dashboard-window', (action: string) => {
		if (action === 'minimize' || action === 'minimize-dashboard') {
			if (dashboard) dashboard.minimize();
		} else if (action === 'close' || action === 'close-dashboard') {
			destroyVueApp(dashboard, () => (dashboard = null));
			destroyVueApp(splashscreen, () => (splashscreen = null));
		} else if (action === 'show' || action === 'show-dashboard') {
			if (dashboard) {
				dashboard.show();
				dashboard.focus();
				return destroyVueApp(splashscreen, () => (splashscreen = null));
			}

			dashboard = VueApp(() => (dashboard = null), {
				title: 'Nova Wallpaper',
				width: 1004,
				height: 770,
				minWidth: 752,
				minHeight: 770,
				resizable: true,
				fullscreenable: false,
			});

			splashscreen = VueApp(() => (splashscreen = null), {
				title: 'Nova Wallpaper Splashscreen',
				width: 180,
				height: 180,
				frame: false,
				alwaysOnTop: true,
				transparent: true,
				skipTaskbar: true,
				resizable: false,
				focusable: false,
				hasShadow: false,
			});

			loadVueApp(dashboard, 'main=true', false).then((isLoaded) => {
				if (!isLoaded || !dashboard || !splashscreen) return;
				loadVueApp(splashscreen, 'splashscreen=true');
			});
		}
	});

	events.$on('dashboard-active-changed', () => {
		if (dashboard) dashboard.webContents.send('refresh', 'database');
	});
};

export const dashboardFilesListener = (
	action: Invoke<FilesChannel>,
	onlyFolder: boolean,
	resolve: (v: Response<FilesChannel>) => void
) => {
	const openFile = (name: string, extensions: string[]) => {
		if (!dashboard) return;
		dialog.showOpenDialog(dashboard, { properties: ['openFile'], filters: [{ name, extensions }] }).then((result) => {
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
				.filter((file) => file !== undefined);
			resolve(content.length ? { path: folderPath, content } : { error: 'The folder is empty.' });
		});
	};

	if (action === 'media') return openFile('Media', ['png', 'jpg', 'jpeg', 'mp4', 'gif']);
	if (action === 'webpage') return openFile('Webpage', ['html']);
	if (action === 'executable') return openFile('Program File', ['exe']);
	if (action === 'folder') return openDirectory();
	resolve({ error: `${action}: This action is not supported` });
};
