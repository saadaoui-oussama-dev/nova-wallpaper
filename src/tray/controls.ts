const { app } = require('electron');
import { events, noPadding, padding, MenuOption } from '@/global/electron-utils';
import { openDashboard } from '@/dashboard/electron';

let soundsStateLabel = 'Mute Wallpaper';

export const renderControls = (options: MenuOption[]): void => {
	const pad = options.length ? true : false;

	const soundsController: MenuOption = {
		label: padding(soundsStateLabel, pad),
		click: () => {
			if (noPadding(visibilityController.label as string) === 'Show Wallpaper') return;
			const oldLabel = noPadding(soundsController.label as string);
			const newLabel = padding(oldLabel === 'Mute Wallpaper' ? 'Unmute Wallpaper' : 'Mute Wallpaper', pad);
			soundsStateLabel = soundsController.label = newLabel;
			events.$emit('renderMenu', options);
		},
	};

	const visibilityController: MenuOption = {
		label: padding('Hide Wallpaper', pad),
		click: () => {
			const oldLabel = noPadding(visibilityController.label as string);
			const newLabel = padding(oldLabel === 'Hide Wallpaper' ? 'Show Wallpaper' : 'Hide Wallpaper', pad);
			visibilityController.label = newLabel;
			if (oldLabel !== 'Show Wallpaper') soundsStateLabel = soundsController.label = padding('Unmute Wallpaper', pad);
			events.$emit('renderMenu', options);
			if (oldLabel === 'Show Wallpaper') events.$emit('dashboard', 'minimize');
		},
	};

	options.push(
		{ type: 'separator' },
		{
			label: padding('Reload Wallpaper', pad),
			click: () => {
				events.$emit('reloadMenu');
				events.$emit('dashboard', 'minimize');
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
				events.$emit('renderMenu', [{ label: 'Waiting 3 seconds to close' }]);
				events.$emit('dashboard', 'close');
				setTimeout(() => app.exit(), 3000);
			},
		}
	);
};
