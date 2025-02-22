import { BrowserWindow } from 'electron';
import { VueApp, loadVueApp, destroyVueApp } from '@/electron-vue/load-app';
import { events } from '@/global/utils';

let dashboard: BrowserWindow | null;

let splashscreen: BrowserWindow | null;

export const initDashboard = () => {
	events.$on('dashboard-window', (action: string) => {
		if (action === 'minimize' || action === 'minimize-dashboard') {
			if (dashboard) dashboard.minimize();
		} else if (action === 'close' || action === 'close-dashboard') {
			destroyVueApp(dashboard, () => (dashboard = null));
			destroyVueApp(splashscreen, () => (splashscreen = null));
		} else if (action === 'show' || action === 'show-dashboard') {
			if (dashboard) {
				dashboard.show();
				dashboard.focus();
				return destroyVueApp(splashscreen, () => (splashscreen = null));
			}

			dashboard = VueApp(() => (dashboard = null), {
				title: 'Nova Wallpaper',
				width: 1004,
				height: 770,
				minWidth: 752,
				minHeight: 770,
				resizable: true,
				fullscreenable: false,
			});

			splashscreen = VueApp(() => (splashscreen = null), {
				title: 'Nova Wallpaper Splashscreen',
				width: 180,
				height: 180,
				frame: false,
				alwaysOnTop: true,
				transparent: true,
				skipTaskbar: true,
				resizable: false,
				focusable: false,
				hasShadow: false,
			});

			loadVueApp(dashboard, 'main=true', false).then((isLoaded) => {
				if (!isLoaded || !dashboard || !splashscreen) return;
				loadVueApp(splashscreen, 'splashscreen=true');
			});
		}
	});

	events.$on('active-wallpaper-changed', (trigger: string) => {
		if (dashboard && trigger !== 'dashboard') dashboard.webContents.send('refresh', 'database');
	});
};
