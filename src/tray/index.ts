const { Tray, Menu } = require('electron');
import { events, joinPublic, MenuOption } from '@/global/electron-utils';
import { renderControls } from '@/tray/controls';

let tray: Electron.Tray;

export const createTray = () => {
	if (tray) return;

	tray = new Tray(joinPublic('@/public/img/logo.png'));
	tray.setToolTip('Nova Wallpaper');
	tray.on('click', () => tray.popUpContextMenu());

	events.$on('renderMenu', (options: MenuOption[]) => tray.setContextMenu(Menu.buildFromTemplate(options)));

	events.$on('reloadMenu', () => {
		const options: MenuOption[] = [];
		renderControls(options);
		events.$emit('renderMenu', options);
	});

	events.$emit('reloadMenu');
};
