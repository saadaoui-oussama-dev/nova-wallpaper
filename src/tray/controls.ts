const { app } = require('electron');
import eventsBus from '@/global/events';
import { openDashboard } from '@/dashboard/electron';
import { noPadding, padding, MenuOption } from '@/tray/helpers';

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
			eventsBus.$emit('renderMenu', options);
		},
	};

	const visibilityController: MenuOption = {
		label: padding('Hide Wallpaper', pad),
		click: () => {
			const oldLabel = noPadding(visibilityController.label as string);
			const newLabel = padding(oldLabel === 'Hide Wallpaper' ? 'Show Wallpaper' : 'Hide Wallpaper', pad);
			visibilityController.label = newLabel;
			if (oldLabel !== 'Show Wallpaper') soundsStateLabel = soundsController.label = padding('Unmute Wallpaper', pad);
			eventsBus.$emit('renderMenu', options);
			if (oldLabel === 'Show Wallpaper') eventsBus.$emit('dashboard', 'minimize');
		},
	};

	options.push(
		{ type: 'separator' },
		{
			label: padding('Reload Wallpaper', pad),
			click: () => {
				eventsBus.$emit('reloadMenu');
				eventsBus.$emit('dashboard', 'minimize');
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
				eventsBus.$emit('renderMenu', [{ label: 'Waiting 3 seconds to close' }]);
				eventsBus.$emit('dashboard', 'close');
				setTimeout(() => app.exit(), 3000);
			},
		}
	);
};
