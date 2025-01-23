const { app } = require('electron');
const { join } = require('path');
const { statSync } = require('fs');

export type MenuOption = Electron.MenuItemConstructorOptions | Electron.MenuItem;

export const joinPublic = (path: string): string => {
	return join(__dirname, path.replace('@/public', app.isPackaged ? '' : '../public'));
};

export const fileSizeChecker = (filePath: string): string => {
	try {
		return statSync(filePath).size <= 40 * 1024 * 1024 ? '' : 'File exceeds the 40MB limit.';
	} catch {
		return `Unable to access the file { ${{ filePath }} }.`;
	}
};
