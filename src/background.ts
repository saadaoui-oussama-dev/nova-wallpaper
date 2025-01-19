'use strict';

import { app, protocol, BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
import { createTray } from './tray';
const isDevelopment = process.env.NODE_ENV !== 'production';

require('@electron/remote/main').initialize();
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

app.on('window-all-closed', (event: Electron.Event) => event.preventDefault());

app.on('ready', async () => {
	if (isDevelopment) {
		try {
			await installExtension(VUEJS3_DEVTOOLS);
		} catch {}
	}
	createTray();
});

if (isDevelopment) {
	if (process.platform !== 'win32') process.on('SIGTERM', () => app.quit());
	else process.on('message', (data) => data === 'graceful-exit' && app.quit());
}
