const { join } = require('path');
const { readdirSync } = require('fs');
import { app, dialog, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import eventsBus from '@/global/events';
import { isMediaSupported, isSupported } from '@/global/utils';

let dashboard: BrowserWindow | undefined;

export const openDashboard = async () => {
	if (dashboard) return dashboard.focus();

	dashboard = new BrowserWindow({
		width: 850,
		height: 600,
		frame: false,
		show: false,
		transparent: true,
		resizable: false,
		title: 'Nova Wallpaper',
		icon: join(__dirname, app.isPackaged ? '/imgs/logo.png' : '../public/imgs/logo.png'),
		webPreferences: {
			devTools: false,
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true,
			preload: join(__dirname, app.isPackaged ? '/scripts/preload.js' : '../public/scripts/preload.js'),
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
		return eventsBus.$emit('dashboard', 'close');
	}
};

eventsBus.$on('dashboard', (action: string) => {
	if (!dashboard) return;
	if (action === 'focus') return dashboard.focus();
	if (action === 'minimize') return dashboard.minimize();
	if (action === 'close') {
		dashboard.destroy();
		dashboard = undefined;
	}
});

ipcMain.on('dashboard', (_, key: string) => {
	if (['close', 'minimize'].includes(key)) return eventsBus.$emit('dashboard', key);
});

ipcMain.handle('files', async (_, type: string) => {
	return new Promise<{ path: string; content: string[] }>((resolve) => {
		const openFile = (name: string, extensions: string[]) => {
			if (!dashboard) return;
			dialog.showOpenDialog(dashboard, { properties: ['openFile'], filters: [{ name, extensions }] }).then((result) => {
				if (result.canceled || !result.filePaths.length) resolve({ path: '', content: [] });
				const path = result.filePaths[0];
				resolve(isSupported(path) ? { path: result.filePaths[0], content: [] } : { path: '', content: [] });
			});
		};

		const openDirectory = () => {
			if (!dashboard) return;
			dialog.showOpenDialog(dashboard, { properties: ['openDirectory'] }).then((result) => {
				if (result.canceled || !result.filePaths.length) resolve({ path: '', content: [] });
				const path = result.filePaths[0];
				resolve({ path, content: readdirSync(path).filter((filename: string) => isMediaSupported(filename)) });
			});
		};

		if (type === 'image') openFile('Images', ['png', 'jpg', 'jpeg']);
		else if (type === 'video') openFile('Videos', ['mp4']);
		else if (type === 'html') openFile('Webpages', ['html']);
		else if (type === 'folder') openDirectory();
		else resolve({ path: '', content: [`${type}: This type of wallpapers is not supported yet`] });
	});
});
