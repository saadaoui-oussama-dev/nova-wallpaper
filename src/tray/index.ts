const { Tray, Menu } = require('electron');
import eventsBus from '@/global/events';
import { joinPublic, MenuOption } from '@/global/electron-utils';
import { renderControls } from '@/tray/controls';

let tray: Electron.Tray;

export const createTray = () => {
	if (tray) return;

	tray = new Tray(joinPublic('@/public/imgs/logo.png'));
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
