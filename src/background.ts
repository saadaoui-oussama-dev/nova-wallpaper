'use strict';

import { app, dialog, protocol } from 'electron';
import { createTray } from '@/tray';

require('@electron/remote/main').initialize();
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

const alreadyRunning = !app.requestSingleInstanceLock();

app.on('ready', async () => {
	if (alreadyRunning) {
		dialog.showMessageBoxSync({
			type: 'error',
			title: 'Nova Wallpaper',
			message: 'Another instance of Nova Wallpaper is already running.\nPlease close the application from the task manager and try again.', // prettier-ignore
			buttons: ['OK'],
		});
		app.quit();
	} else {
		createTray();
	}
});

app.on('window-all-closed', ((event: Electron.Event) => event && event.preventDefault()) as () => void);

if (process.env.NODE_ENV !== 'production') {
	if (process.platform !== 'win32') process.on('SIGTERM', () => app.quit());
	else process.on('message', (data) => data === 'graceful-exit' && app.quit());
}
