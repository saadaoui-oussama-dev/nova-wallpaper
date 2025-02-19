const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { attach, reset } from '@/renderer/electron-as-wallpaper';
import { database } from '@/global/database';
import { readJson, writeJSON } from '@/global/json';
import { events, getAreas, joinPublic, threadsManager, compareMaps, getMapChanges } from '@/global/utils';
import { isSupported, isURL } from '@/global/files';
import { Wallpaper } from '@/types/wallpaper';
import { Invoke, Response, RenderJSONChannel, ExecuteChannel } from '@/types/channels';

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
			preload: joinPublic('@/public/js/renderer-preload.js'),
		},
	});

	render.webContents.openDevTools();
	render.webContents.setMaxListeners(0);

	attach(render, { transparent: true, forwardMouseInput: true });

	const setVisibility = (state: boolean, byUser: boolean) => {
		if (state) return render.show();
		if (byUser) render.webContents.setAudioMuted(true);
		render.hide();
		const id = setInterval(() => reset(), 10);
		setTimeout(() => clearInterval(id), 500);
	};

	events.$on('renderer-sync-action', (action: string) => {
		if (action === 'change') onChangesListener();
		if (action === 'mute' || action === 'unmute') render.webContents.setAudioMuted(action === 'mute');
		if (action === 'show' || action === 'hide' || action === 'exit') setVisibility(action === 'show', true);
		if (action === 'exit') setTimeout(() => app.exit(), 500);
	});

	ipcMain.handle('renderer-json', (_, action: Invoke<RenderJSONChannel>, path: string, dataOrIsArray?: any) => {
		return new Promise<Response<RenderJSONChannel>>((resolve) => {
			if (wallpaper === null) return;
			if (path === '' || typeof path !== 'string' || !path.startsWith('@'))
				return resolve({ permitted: false, exist: false, valid: false, data: null });
			else if (path.includes('../') || path.includes('/..') || path.includes('..\\') || path.includes('\\..'))
				return resolve({ permitted: false, exist: false, valid: false, data: null });
			path = join(wallpaper.path, '../', path.slice(1));
			if (action === 'read') resolve({ permitted: true, ...readJson(path, dataOrIsArray) });
			else if (action === 'write') resolve({ permitted: true, ...writeJSON(path, dataOrIsArray) });
			else resolve({ permitted: false, exist: false, valid: false, data: null });
		});
	});

	ipcMain.handle('renderer-execute', (_, __: Invoke<ExecuteChannel>, permissionId: string) => {
		return new Promise<Response<ExecuteChannel>>((resolve) => {
			if (wallpaper === null) return resolve({ permitted: false, success: false });
			const path = wallpaper.permissions ? wallpaper.permissions[permissionId] : '';
			if (!path || typeof path !== 'string') return resolve({ permitted: false, success: false });
			try {
				if (isURL(path)) return shell.openExternal(path);
				if (!path.startsWith('::{') && !existsSync(path)) throw new Error('File Not Found');
				const params = path.endsWith('.exe') ? [path, []] : ['explorer', [path]];
				spawn(...params, { detached: true, stdio: 'ignore' }).unref();
				return resolve({ permitted: true, success: true });
			} catch {
				return resolve({ permitted: true, success: false });
			}
		});
	});

	const onChangesListener = () => {
		threadsManager('change-wallpaper', async () => {
			let newWallpaper: Wallpaper | null = null;
			let oldWallpaper = wallpaper;

			// Retrieve the active wallpaper from the database
			const { doc: _active } = database.read('active');
			const active = Array.isArray(_active) && _active[0] ? _active[0].value : -1;
			if (active !== -1 && typeof active === 'number') {
				const { doc: list } = database.read('wallpaper', { where: { id: active } });
				if (Array.isArray(list) && list[0]) newWallpaper = list[0] as Wallpaper;
			}

			// Prepare media wallpaper if it's an image or video
			const isMedia = !!newWallpaper && !newWallpaper.path.endsWith('.html');
			const mediaPayload: [string, string][] = [];
			if (isMedia && newWallpaper) {
				if (!isSupported(newWallpaper.path, true) || !existsSync(newWallpaper.path)) newWallpaper = null;
				else mediaPayload.push(['path', newWallpaper.path]);
			}

			// Determine if the wallpaper needs to be reloaded
			const wallpaperChanged =
				!oldWallpaper ||
				!newWallpaper ||
				oldWallpaper.id !== newWallpaper.id ||
				!compareMaps(newWallpaper.queryParams, oldWallpaper.queryParams) ||
				!compareMaps(newWallpaper.settings, oldWallpaper.settings, true) ||
				!compareMaps(newWallpaper.permissions, oldWallpaper.permissions, true);
			wallpaper = newWallpaper as Wallpaper;

			// Load or reload the active wallpaper if necessary
			if (wallpaperChanged) {
				try {
					const path = isMedia ? joinPublic('@/public/media.html') : wallpaper.path;
					const query = Object.entries(isMedia ? {} : wallpaper.queryParams || {});
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

			// Identify and apply only the changed settings and permissions
			render.webContents.removeAllListeners('did-stop-loading');
			const settings = getMapChanges(wallpaper.settings, oldWallpaper ? oldWallpaper.settings : undefined);
			const permissions = getMapChanges(wallpaper.permissions, oldWallpaper ? oldWallpaper.permissions : undefined);
			const sendOptions = (functionName: string, options: [string, string | number | boolean][]) => {
				return options.map(async ([id, value]) => {
					const instruction = `window.${functionName}?.(${JSON.stringify(id)}, ${JSON.stringify(value)});`;
					await render.webContents.executeJavaScript(instruction).catch(() => {});
				});
			};
			await Promise.all(sendOptions('novaSettingsListener', mediaPayload));
			await Promise.all([
				...sendOptions('novaSettingsListener', settings),
				...sendOptions('livelyPropertyListener', settings),
				...sendOptions('novaPermissionsListener', permissions),
			]);
			if (settings.length || permissions.length || !oldWallpaper)
				await render.webContents.executeJavaScript('window.novaLoadedListener()').catch(() => {});
		});
	};

	onChangesListener();
};
