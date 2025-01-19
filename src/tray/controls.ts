const { app } = require('electron');
import eventsBus from '@/events';
import { noPadding, padding, MenuOption } from './helpers';

let soundsStateLabel = 'Mute Wallpaper';

export const renderControls = (options: MenuOption[]): MenuOption[] => {
	const pad = options.length ? true : false;
	return [
		{ type: 'separator' },
		{
			label: padding('Reload Wallpaper', pad),
			click: () => {
				eventsBus.$emit('reloadMenu');
			},
		},
		{
			label: padding(soundsStateLabel, pad),
			click: () => {
				if (noPadding(options[options.length - 3].label as string) === 'Show Wallpaper') return;
				const oldLabel = noPadding(options[options.length - 4].label as string);
				const newLabel = padding(oldLabel === 'Mute Wallpaper' ? 'Unmute Wallpaper' : 'Mute Wallpaper', pad);
				soundsStateLabel = options[options.length - 4].label = newLabel;
				eventsBus.$emit('renderMenu', options);
			},
		},
		{
			label: padding('Hide Wallpaper', pad),
			click: () => {
				const oldLabel = noPadding(options[options.length - 3].label as string);
				const newLabel = padding(oldLabel === 'Hide Wallpaper' ? 'Show Wallpaper' : 'Hide Wallpaper', pad);
				options[options.length - 3].label = newLabel;
				if (oldLabel !== 'Show Wallpaper')
					soundsStateLabel = options[options.length - 4].label = padding('Unmute Wallpaper', pad);
				eventsBus.$emit('renderMenu', options);
			},
		},
		{
			label: padding('Exit App', pad),
			click: () => {
				eventsBus.$emit('renderMenu', [{ label: 'Waiting 3 seconds to close' }]);
				setTimeout(() => app.exit(), 3000);
			},
		},
	];
};
