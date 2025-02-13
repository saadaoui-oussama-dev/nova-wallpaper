import { app, BrowserWindow } from 'electron';
import { database } from '@/global/database';
import { events, getAreas, isURL, joinPublic } from '@/global/electron-utils';
import { Wallpaper } from '@/types/wallpaper';

let render: Electron.BrowserWindow;
let wallpaper: Wallpaper | null = null;

export const createRenderer = () => {
	if (render) return;

	render = new BrowserWindow({
		skipTaskbar: true,
		fullscreen: true,
		x: 0,
		y: 0,
		frame: false,
		show: false,
		focusable: false,
		transparent: true,
		resizable: false,
		title: 'Nova Wallpaper',
		icon: joinPublic('@/public/img/logo.png'),
		webPreferences: {
			devTools: false,
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	// attach(render, { transparent: true, forwardMouseInput: true });

	const setVisibility = (state: boolean, byUser: boolean) => {
		if (state) return render.show();
		if (byUser) render.webContents.setAudioMuted(true);
		render.hide();
		// const id = setInterval(() => reset(), 10);
		// setTimeout(() => clearInterval(id), 500);
	};

	const setCurrentWallpaper = async () => {
		const { doc: _active } = await database.read('active');
		const active = Array.isArray(_active) && _active[0] ? (_active[0].value as string) : '';
		if (!active || typeof active !== 'string') wallpaper = null;
		const { doc: list } = await database.read('wallpaper', { _id: active });
		if (!Array.isArray(list) || !list.length || !list[0] || !list[0].path) wallpaper = null;
		wallpaper = list[0] as Wallpaper;
	};

	const renderActiveWallpaper = async () => {
		await setCurrentWallpaper();
		if (!wallpaper) return;
		try {
			if (wallpaper.path.endsWith('.html')) await render.loadFile(wallpaper.path);
			setVisibility(true, false);
		} catch {
			setVisibility(false, false);
			return;
		}
		onChangesListener(false);
	};

	const onChangesListener = async (setWallpaper: boolean) => {
		if (setWallpaper) await setCurrentWallpaper();
		if (!wallpaper) return;
		if (wallpaper.taskbar) render.setFullScreen(true);
		else render.setBounds({ height: getAreas().workarea.height });
	};

	events.$on('renderer-sync-action', (action: string) => {
		if (action === 'wallpaper') renderActiveWallpaper();
		if (action === 'change') onChangesListener(true);
		if (action === 'mute' || action === 'unmute') render.webContents.setAudioMuted(action === 'mute');
		if (action === 'show' || action === 'hide' || action === 'exit') setVisibility(action === 'show', true);
		if (action === 'exit') setTimeout(() => app.exit(), 2000);
	});

	renderActiveWallpaper();
};
