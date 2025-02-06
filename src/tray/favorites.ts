import { Wallpaper } from '@/dashboard/store';
import { openDatabase } from '@/global/database';
import { events, padding, MenuOption, getFileName } from '@/global/electron-utils';

export const renderFavorites = async (options: MenuOption[]): Promise<void> => {
	try {
		const { doc: list } = await openDatabase().read('wallpaper', { favorite: true });
		const { doc: _active } = await openDatabase().read('active');
		const active = Array.isArray(_active) && _active[0] ? (_active[0].value as string) : '';

		const wallpapers: MenuOption[] = list.map((wallpaper: Wallpaper, index: number) => ({
			label: padding(getFileName(wallpaper.label, 'name', 25) || `Wallpaper ${index + 1}`),
			type: 'checkbox',
			checked: active === wallpaper.id,
			click: () => {
				try {
					openDatabase().update('active', { value: wallpaper.id });
					events.$emit('active-changed');
					events.$emit('reloadMenu');
				} catch {}
			},
		}));

		options.push(...wallpapers.slice(0, 9));
	} catch {
		console.log();
	}
};
