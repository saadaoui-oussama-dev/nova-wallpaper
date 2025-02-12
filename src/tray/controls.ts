const { app } = require('electron');
import { openDashboard } from '@/dashboard/electron';
import { events, noPadding, padding } from '@/global/electron-utils';

let soundsStateLabel = 'Mute Wallpaper';

export const renderControls = (options: Electron.MenuItemConstructorOptions[]): void => {
	const pad = options.length ? true : false;

	const soundsController: Electron.MenuItemConstructorOptions = {
		label: padding(soundsStateLabel, pad),
		click: () => {
			if (noPadding(visibilityController.label as string) === 'Show Wallpaper') return;
			const oldLabel = noPadding(soundsController.label as string);
			const newLabel = padding(oldLabel === 'Mute Wallpaper' ? 'Unmute Wallpaper' : 'Mute Wallpaper', pad);
			soundsStateLabel = soundsController.label = newLabel;
			events.$emit('tray-render-menu', options);
		},
	};

	const visibilityController: Electron.MenuItemConstructorOptions = {
		label: padding('Hide Wallpaper', pad),
		click: () => {
			const oldLabel = noPadding(visibilityController.label as string);
			const newLabel = padding(oldLabel === 'Hide Wallpaper' ? 'Show Wallpaper' : 'Hide Wallpaper', pad);
			visibilityController.label = newLabel;
			if (oldLabel !== 'Show Wallpaper') soundsStateLabel = soundsController.label = padding('Unmute Wallpaper', pad);
			events.$emit('tray-render-menu', options);
			if (oldLabel === 'Show Wallpaper') events.$emit('dashboard-window', 'minimize');
		},
	};

	options.push(
		{ type: 'separator' },
		{
			label: padding('Reload Wallpaper', pad),
			click: () => {
				events.$emit('tray-reload-menu');
				events.$emit('dashboard-window', 'minimize');
			},
		},
		soundsController,
		visibilityController,
		{ type: 'separator' },
		{
			label: padding('Open Dashboard', pad),
			click: () => openDashboard(),
		},
		{
			label: padding('Exit App', pad),
			click: () => {
				events.$emit('tray-render-menu', [{ label: 'Waiting 3 seconds to close' }]);
				events.$emit('dashboard-window', 'close');
				setTimeout(() => app.exit(), 3000);
			},
		}
	);
};
