import { app } from 'electron';
import { processType } from '@/process';
import { openDashboard } from '@/dashboard/electron';
import { events } from '@/global/utils';

let soundsStateLabel = 'Mute Wallpaper';

export const renderControls = (options: Electron.MenuItemConstructorOptions[]): void => {
	const pad = options.length ? true : false;

	const padding = (label: string, padding = true) => events.$emit('padding', label, padding)[0] as string;

	const noPadding = (label: string) => events.$emit('noPadding', label)[0] as string;

	const soundsController: Electron.MenuItemConstructorOptions = {
		label: padding(soundsStateLabel, pad),
		click: () => {
			if (noPadding(visibilityController.label as string) === 'Show Wallpaper') return;
			const oldLabel = noPadding(soundsController.label as string);
			const newLabel = padding(oldLabel === 'Mute Wallpaper' ? 'Unmute Wallpaper' : 'Mute Wallpaper', pad);
			soundsStateLabel = soundsController.label = newLabel;
			events.$emit('tray-render-menu', options);
			events.$emit('renderer-sync-action', oldLabel === 'Mute Wallpaper' ? 'mute' : 'unmute');
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
			events.$emit('renderer-sync-action', oldLabel === 'Hide Wallpaper' ? 'hide' : 'show');
		},
	};

	options.push(
		{ type: 'separator' },
		soundsController,
		visibilityController,
		{
			label: padding('Open Dashboard', pad),
			click: () => openDashboard(),
		},
		{
			label: padding('Exit App', pad),
			click: () => {
				events.$emit('tray-render-menu', []);
				events.$emit('dashboard-window', 'close');
				events.$emit('renderer-sync-action', 'exit');
				if (processType !== 'both') setTimeout(() => app.exit(), 3000);
			},
		}
	);
};
