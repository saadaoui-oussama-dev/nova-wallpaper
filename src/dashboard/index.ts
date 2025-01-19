import { app, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
const { join } = require('path');

let dashboard: BrowserWindow | undefined;

export const openDashboard = async () => {
	if (dashboard) return dashboard.focus();

	dashboard = new BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
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

	dashboard.on('close', () => (dashboard = undefined));
	try {
		if (process.env.WEBPACK_DEV_SERVER_URL) {
			await dashboard.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
		} else {
			createProtocol('app');
			await dashboard.loadURL('app://./index.html');
		}
	} catch {
		return closeDashboard();
	}
	dashboard.webContents.executeJavaScript('window.eventsBus.$emit("nova-wallpaper-preload", NovaWallpaper);');
};

export const closeDashboard = () => {
	if (dashboard) {
		dashboard.destroy();
		dashboard = undefined;
	}
};

ipcMain.on('dashboard', (_, key: string, ...args: any[]) => {
	if (!dashboard) return;
	if (key === 'close') return closeDashboard();
	if (key === 'minimize') return dashboard.minimize();
});

ipcMain.handle('dashboard', async (_, key: string, ...data: any[]) => {
	console.log('Data requested:', key, ...data);
});
