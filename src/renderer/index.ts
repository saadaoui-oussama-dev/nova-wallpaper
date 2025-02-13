import { BrowserWindow } from 'electron';
import { database } from '@/global/database';
import { events, isURL, joinPublic } from '@/global/electron-utils';
import { Wallpaper } from '@/types/wallpaper';

let render: Electron.BrowserWindow;
let wallpaper: Wallpaper | null = null;

export const createRenderer = () => {
	if (render) return;

	render = new BrowserWindow({
		skipTaskbar: true,
		fullscreen: true,
		frame: false,
		show: false,
		focusable: false,
		transparent: true,
		resizable: false,
		title: 'Nova Wallpaper',
		icon: joinPublic('@/public/img/logo.png'),
		webPreferences: {
			devTools: true,
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	render.webContents.openDevTools();

	// attach(render, { transparent: true, forwardMouseInput: true });

	const setVisibility = (state: boolean, byUser: boolean) => {
		if (state) return render.show();
		if (byUser) render.webContents.setAudioMuted(true);
		render.hide();
		// const id = setInterval(() => reset(), 10);
		// setTimeout(() => clearInterval(id), 500);
	};

	events.$on('renderer-active-changed', async () => {
		// Select the current wallpaper
		const { doc: _active } = await database.read('active');
		const active = Array.isArray(_active) && _active[0] ? (_active[0].value as string) : '';
		if (!active || typeof active !== 'string') return;
		const { doc: list } = await database.read('wallpaper', { _id: active });
		if (!Array.isArray(list) || !list.length || !list[0] || !list[0].path) return;
		wallpaper = list[0] as Wallpaper;

		// Show the wallpaper and make the window visible
		try {
			if (wallpaper.path.endsWith('.html')) await render.loadFile(wallpaper.path);
			setVisibility(true, false);
		} catch {
			setVisibility(false, false);
			return;
		}
	});

	events.$emit('renderer-active-changed');
};
