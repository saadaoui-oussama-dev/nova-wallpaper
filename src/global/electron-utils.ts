const { app } = require('electron');
const { join } = require('path');

export type MenuOption = Electron.MenuItemConstructorOptions | Electron.MenuItem;

export const joinPublic = (path: string): string => {
	return join(__dirname, path.replace('@', app.isPackaged ? '' : '../public'));
};
