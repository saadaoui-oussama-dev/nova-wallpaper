const { Tray, Menu } = require('electron');
import { events, joinPublic } from '@/global/electron-utils';
import { renderControls } from '@/tray/controls';
import { renderFavorites } from '@/tray/favorites';

let tray: Electron.Tray;

export const createTray = () => {
	if (tray) return;

	tray = new Tray(joinPublic('@/public/img/logo.png'));
	tray.setToolTip('Nova Wallpaper');
	tray.on('click', () => tray.popUpContextMenu());

	events.$on('tray-render-menu', (options: Electron.MenuItemConstructorOptions[]) => {
		tray.setContextMenu(Menu.buildFromTemplate(options));
	});

	events.$on('tray-reload-menu', async () => {
		const options: Electron.MenuItemConstructorOptions[] = [];
		await renderFavorites(options);
		renderControls(options);
		events.$emit('tray-render-menu', options);
	});

	events.$emit('tray-reload-menu');
};
