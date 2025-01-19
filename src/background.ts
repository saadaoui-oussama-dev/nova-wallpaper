'use strict';

import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';

require('@electron/remote/main').initialize();
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

async function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
		transparent: true,
		title: 'Nova Wallpaper',
		icon: 'src/assets/images/logo.png',
		webPreferences: {
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true,
		},
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
		// win.webContents.openDevTools();
	} else {
		createProtocol('app');
		win.loadURL('app://./index.html');
	}
}

app.on('window-all-closed', (event: Electron.Event) => {
	event.preventDefault();
});

app.on('ready', async () => {
	if (isDevelopment) {
		try {
			await installExtension(VUEJS3_DEVTOOLS);
		} catch {}
	}
	createWindow();
});

if (isDevelopment) {
	if (process.platform !== 'win32') process.on('SIGTERM', () => app.quit());
	else process.on('message', (data) => data === 'graceful-exit' && app.quit());
}
