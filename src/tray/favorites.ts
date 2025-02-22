import { database } from '@/global/database';
import { events, getFileName } from '@/global/utils';
import { Wallpaper } from '@/types/wallpaper';

export const renderFavorites = async (options: Electron.MenuItemConstructorOptions[]): Promise<void> => {
	try {
		const { doc: list } = database.read('wallpaper', { where: { favorite: true } });
		if (!Array.isArray(list) || !list.length) return;
		const { doc: _active } = database.read('active');
		const active = Array.isArray(_active) && _active[0] ? (_active[0].value as number) : -1;
		const padding = (label: string, padding = true) => events.$emit('padding', label, padding)[0] as string;

		const wallpapers: Electron.MenuItemConstructorOptions[] = list.map((wallpaper: Wallpaper, index: number) => ({
			label: padding(getFileName(wallpaper.label, 'name', 25) || `Untitled Wallpaper ${index + 1}`),
			type: 'checkbox',
			checked: active === wallpaper.id,
			click: async () => {
				try {
					if (!database.update('active', { value: active === wallpaper.id ? '' : wallpaper.id }).error) {
						events.$emit('active-wallpaper-changed', 'tray');
						events.$emit('tray-reload-menu');
						setTimeout(() => {
							events.$emit('dashboard-window', 'minimize');
							events.$emit('renderer-sync-action', 'change');
						}, 400);
					}
				} catch {}
			},
		}));

		options.push(...wallpapers.slice(0, 9));
	} catch {
		console.log();
	}
};
