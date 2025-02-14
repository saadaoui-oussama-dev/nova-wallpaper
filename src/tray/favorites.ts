import { database } from '@/global/database';
import { events, getFileName } from '@/global/electron-utils';
import { Wallpaper } from '@/types/wallpaper';

export const renderFavorites = async (options: Electron.MenuItemConstructorOptions[]): Promise<void> => {
	try {
		const { doc: list } = await database.read('wallpaper', { favorite: true });
		if (!Array.isArray(list) || !list.length) return;
		const { doc: _active } = await database.read('active');
		const active = Array.isArray(_active) && _active[0] ? _active[0].value : '';
		const padding = (label: string, padding = true) => events.$emit('padding', label, padding)[0] as string;

		const wallpapers: Electron.MenuItemConstructorOptions[] = list.map((wallpaper: Wallpaper, index: number) => ({
			label: padding(getFileName(wallpaper.label, 'name', 25) || `Untitled Wallpaper ${index + 1}`),
			type: 'checkbox',
			checked: active === wallpaper.id,
			click: async () => {
				try {
					if (!(await database.update('active', { value: wallpaper.id })).error) {
						events.$emit('dashboard-active-changed');
						events.$emit('tray-reload-menu');
						events.$emit('renderer-sync-action', 'change');
					}
				} catch {}
			},
		}));

		options.push(...wallpapers.slice(0, 9));
	} catch {
		console.log();
	}
};
