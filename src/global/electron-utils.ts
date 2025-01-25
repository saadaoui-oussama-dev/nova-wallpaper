const { app, screen } = require('electron');
const { join } = require('path');
const { statSync } = require('fs');
import { WindowResponse } from '@/global/channel-types';

export * from '@/global/utils';

export type MenuOption = Electron.MenuItemConstructorOptions | Electron.MenuItem;

export const joinPublic = (path: string): string => {
	return join(__dirname, path.replace('@/public', app.isPackaged ? '' : '../public'));
};

export const fileSizeChecker = (filePath: string): string => {
	try {
		return statSync(filePath).size <= 40 * 1024 * 1024 ? '' : 'File exceeds the 40MB limit.';
	} catch {
		return 'Unable to access the file.';
	}
};

export const getAreas = (): WindowResponse => {
	const $screen = screen.getPrimaryDisplay();
	const { width: fw, height: fh } = $screen.size;
	const { width: ww, height: wh } = $screen.workAreaSize;
	const taskbar = { width: fw - ww, height: fh - wh };
	return { fullscreen: { width: fw, height: fh }, workarea: { width: ww, height: wh }, taskbar };
};
