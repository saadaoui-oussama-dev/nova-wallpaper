import { Wallpaper } from '@/dashboard/store';
import { openDatabase } from '@/global/database';
import { events, padding, MenuOption } from '@/global/electron-utils';

export const renderFavorites = async (options: MenuOption[]): Promise<boolean> => {
	try {
		const { doc } = await openDatabase().read('wallpaper', { favorite: true });
		const { doc: _active } = await openDatabase().read('active');
		const active = Array.isArray(_active) && _active[0] ? (_active[0].value as string) : '';

		let thereIsOne = false;

		const wallpapers: MenuOption[] = doc.map((wallpaper: Wallpaper, index: number) => ({
			label: padding(wallpaper.label || `Wallpaper ${index + 1}`),
			type: 'checkbox',
			checked: active === wallpaper.id ? (thereIsOne = true) : false,
			click: () => {
				try {
					openDatabase().update('active', { value: wallpaper.id });
					events.$emit('active-changed');
					events.$emit('reloadMenu');
				} catch {}
			},
		}));

		const favorites = wallpapers.slice(0, wallpapers.length > 9 ? 7 : undefined);
		if (thereIsOne) {
			options.push(...favorites);
			return true;
		} else {
			const firstWallpaper = favorites.find((it) => it.click) as { click: () => void } | undefined;
			if (firstWallpaper) firstWallpaper.click();
			return firstWallpaper ? false : true;
		}
	} catch {
		return true;
	}
};
