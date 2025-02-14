const { Tray, Menu } = require('electron');
import { renderControls } from '@/tray/controls';
import { renderFavorites } from '@/tray/favorites';
import { events, joinPublic } from '@/global/utils';

let tray: Electron.Tray;

export const createTray = () => {
	if (tray) return;

	tray = new Tray(joinPublic('@/public/img/logo.png'));
	tray.setToolTip('Nova Wallpaper');
	tray.on('click', () => tray.popUpContextMenu());

	events.$on('noPadding', (label: string) => {
		return label.endsWith('        ') ? label.substring(0, label.length - '        '.length) : label;
	});

	events.$on('padding', (label: string, padding = true) => {
		return `${events.$emit('noPadding', label)}${padding ? '        ' : ''}`;
	});

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
