import { BrowserWindow, protocol } from 'electron';
import { initialize } from '@electron/remote/main';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { getAreas, joinPublic } from '@/global/utils';

export const prepareVueProtocol = () => {
	initialize();
	protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);
};

export const VueApp = (onClose?: () => void, options?: Electron.BrowserWindowConstructorOptions) => {
	const { width, height } = getAreas().workarea;
	const window = new BrowserWindow({
		show: false,
		icon: joinPublic('@/public/img/logo.png'),
		webPreferences: {
			devTools: true,
			nodeIntegration: false,
			contextIsolation: true,
			preload: joinPublic('@/public/js/dashboard-preload.js'),
		},
		...options,
		width: Math.min(options ? options.width || width : width, width),
		height: Math.min(options ? options.height || height : height, height),
		minWidth: Math.min(options ? options.minWidth || options.width || width : width, width),
		minHeight: Math.min(options ? options.minHeight || options.height || height : height, height),
	});

	window.setMenu(null);
	window.on('close', () => onClose && onClose());
	window.webContents.openDevTools();
	return window;
};

export const loadVueApp = async (window: Electron.BrowserWindow, query?: string, show = true) => {
	try {
		if (process.env.WEBPACK_DEV_SERVER_URL) {
			await window.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}?${query || ''}`);
		} else {
			createProtocol('app');
			await window.loadURL(`app://./index.html/?${query || ''}`);
		}
		if (show) window.show();
		return true;
	} catch {
		return false;
	}
};

export const destroyVueApp = (window?: Electron.BrowserWindow | null, onClose?: () => void) => {
	try {
		if (window) window.destroy();
		if (onClose) onClose();
	} catch {
		if (onClose) onClose();
	}
};
