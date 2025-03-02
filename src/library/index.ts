import { BrowserWindow } from 'electron';
import { VueApp, loadVueApp, destroyVueApp } from '@/electron-vue/load-app';
import { events } from '@/global/utils';

let library: BrowserWindow | null;

let splashscreen: BrowserWindow | null;

export const initLibrary = () => {
	events.$on('library-window', (action: string) => {
		if (action === 'minimize' || action === 'minimize-library') {
			if (library) library.minimize();
		} else if (action === 'close' || action === 'close-library') {
			destroyVueApp(library, () => (library = null));
			destroyVueApp(splashscreen, () => (splashscreen = null));
		} else if (action === 'show' || action === 'show-library') {
			if (library) {
				library.show();
				library.focus();
				return destroyVueApp(splashscreen, () => (splashscreen = null));
			}

			library = VueApp(() => (library = null), {
				title: 'Nova Wallpaper Library',
				width: 752,
				height: 770,
				minWidth: 516,
				minHeight: 516,
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

			loadVueApp(library, 'main=true', false).then((isLoaded) => {
				if (!isLoaded || !library || !splashscreen) return;
				loadVueApp(splashscreen, 'splashscreen=true');
			});
		}
	});

	events.$on('active-wallpaper-changed', (trigger: string) => {
		if (library && trigger !== 'library') library.webContents.send('refresh', 'database');
	});
};
