import { BrowserWindow } from 'electron';
import { VueApp, loadVueApp, destroyVueApp } from '@/electron-vue/load-app';
import { events } from '@/global/utils';

let form: BrowserWindow | null;

export const initForm = () => {
	events.$on('form-window', (action: string) => {
		if (action === 'minimize' || action === 'minimize-form') {
			if (form) return form.minimize();
		} else if (action === 'close' || action === 'close-form') {
			destroyVueApp(form, () => (form = null));
		} else if (action === 'show' || action === 'show-form') {
			if (form) {
				form.show();
				return form.focus();
			}

			form = VueApp(() => (form = null), {
				title: 'Customize Nova Wallpaper',
				width: 355,
				height: 600,
				minWidth: 355,
				maxWidth: 355,
				minHeight: 600,
				resizable: true,
				fullscreenable: false,
			});
			loadVueApp(form, 'form=true', false);
		}
	});

	events.$on('active-wallpaper-changed', (trigger: string) => {
		if (form && trigger !== 'form') form.webContents.send('refresh', 'database');
	});
};
