const { Tray, Menu } = require('electron');
const { join } = require('path');
const { renderControls } = require('./controls');
import eventsBus from '@/events';
import { MenuOption } from './helpers';

let tray: Electron.Tray;

export const createTray = () => {
	if (tray) return;

	tray = new Tray(join(__dirname, '../src/assets/images/logo.png'));
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
