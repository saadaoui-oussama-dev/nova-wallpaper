'use strict';

import { app, protocol } from 'electron';
import { initialize } from '@electron/remote/main';
import { processType, processesConnection } from '@/process';
import { initDashboard } from '@/dashboard';
import { initRenderer } from '@/renderer';
import { initTray } from '@/tray';

initialize();
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

app.on('ready', async () => {
	if (processType !== 'child') {
		initRenderer();
	}
	if (processType !== 'main') {
		initTray();
		initDashboard();
	}
	processesConnection();
});

app.requestSingleInstanceLock();

app.on('second-instance', () => app.exit());

app.on('window-all-closed', ((event: Electron.Event) => event && event.preventDefault()) as () => void);

if (process.env.NODE_ENV !== 'production') {
	if (process.platform !== 'win32') process.on('SIGTERM', () => app.quit());
	else process.on('message', (data) => data === 'graceful-exit' && app.quit());
}
