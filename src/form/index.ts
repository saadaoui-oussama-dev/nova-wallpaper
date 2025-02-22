import { BrowserWindow } from 'electron';
import { events } from '@/global/utils';

let form: BrowserWindow | null;

export const initForm = () => {
	events.$on('form-window', (action: string) => {
	});

	events.$on('active-wallpaper-changed', (trigger: string) => {
		if (form && trigger !== 'form') form.webContents.send('refresh', 'database');
	});
};
