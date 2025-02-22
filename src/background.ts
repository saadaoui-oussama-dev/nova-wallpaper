'use strict';

import { app } from 'electron';
import { startVueEventsListeners } from '@/electron-vue/channels';
import { prepareVueProtocol } from '@/electron-vue/load-app';
import { processType, processesConnection } from '@/process';
import { initRenderer } from '@/renderer';
import { initLibrary } from '@/library';
import { initForm } from '@/form';
import { initTray } from '@/tray';

prepareVueProtocol();

app.on('ready', async () => {
	if (processType !== 'child') {
		initRenderer();
	}
	if (processType !== 'main') {
		startVueEventsListeners();
		initLibrary();
		initForm();
		initTray();
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
