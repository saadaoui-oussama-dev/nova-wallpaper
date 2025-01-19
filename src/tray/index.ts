const { app, Tray, Menu } = require('electron');
const { join } = require('path');
import eventsBus from '@/global/events';
import { MenuOption } from '@/tray/helpers';
import { renderControls } from '@/tray/controls';

let tray: Electron.Tray;

export const createTray = () => {
	if (tray) return;

	tray = new Tray(join(__dirname, app.isPackaged ? '/imgs/logo.png' : '../public/imgs/logo.png'));
	tray.setToolTip('Nova Wallpaper');
	tray.on('click', () => tray.popUpContextMenu());

	eventsBus.$on('renderMenu', (options: MenuOption[]) => tray.setContextMenu(Menu.buildFromTemplate(options)));

	eventsBus.$on('reloadMenu', () => {
		const options: MenuOption[] = [];
		renderControls(options);
		eventsBus.$emit('renderMenu', options);
	});

	eventsBus.$emit('reloadMenu');
};
