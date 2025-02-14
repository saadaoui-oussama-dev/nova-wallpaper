import { app, BrowserWindow } from 'electron';
import { database } from '@/global/database';
import { events, getAreas, joinPublic } from '@/global/electron-utils';
import { multipleThreadsManager, compareMaps, getMapChanges } from '@/global/electron-utils';
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

	events.$on('renderer-sync-action', (action: string) => {
		if (action === 'change') onChangesListener();
		if (action === 'mute' || action === 'unmute') render.webContents.setAudioMuted(action === 'mute');
		if (action === 'show' || action === 'hide' || action === 'exit') setVisibility(action === 'show', true);
		if (action === 'exit') setTimeout(() => app.exit(), 2000);
	});

	const onChangesListener = () => {
		multipleThreadsManager('change-wallpaper', async () => {
			let newWallpaper: Wallpaper | null = null;
			let oldWallpaper = wallpaper;

			// Retrieve the active wallpaper from the database
			const { doc: _active } = await database.read('active');
			const active = Array.isArray(_active) && _active[0] ? _active[0].value : '';
			if (active && typeof active === 'string') {
				const { doc: list } = await database.read('wallpaper', { _id: active });
				if (Array.isArray(list) && list[0]) newWallpaper = list[0] as Wallpaper;
			}

			// Determine if the wallpaper needs to be reloaded
			const wallpaperChanged =
				!oldWallpaper ||
				!newWallpaper ||
				oldWallpaper.id !== newWallpaper.id ||
				!compareMaps(newWallpaper.queryParams, oldWallpaper.queryParams) ||
				!compareMaps(newWallpaper.settings, oldWallpaper.settings, true);
			wallpaper = newWallpaper as Wallpaper;

			// Load or reload the active wallpaper if necessary
			if (wallpaperChanged) {
				try {
					const path = wallpaper.path.endsWith('.html') ? wallpaper.path : './renderer/media.html';
					const query = Object.entries(path === './renderer/media.html' ? {} : wallpaper.queryParams || {});
					const url = query.length ? path + '?' + query.map(([k, v]) => `${k}=${v}`).join('&') : path;
					await render.loadURL(url);
					oldWallpaper = null;
					setVisibility(true, false);
				} catch {
					wallpaper = null;
					setVisibility(false, false);
				}
			}
			if (!wallpaper) return;

			// Adjust fullscreen mode based on taskbar settings
			if (wallpaper.taskbar) render.setFullScreen(true);
			else render.setBounds({ height: getAreas().workarea.height });

			// Identify and apply only the changed settings
			const settings = getMapChanges(wallpaper.settings, oldWallpaper ? oldWallpaper.settings : undefined);
			await Promise.all([
				...settings.map(async ([id, value]) => {
					const instruction = `window.novaSettingsListener(${JSON.stringify(id)}, ${JSON.stringify(value)});`;
					await render.webContents.executeJavaScript(instruction).catch(() => {});
				}),
			]);
			await render.webContents.executeJavaScript('window.novaLoaded()').catch(() => {});
		});
	};

	onChangesListener();
};
