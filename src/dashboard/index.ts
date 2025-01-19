import { BrowserWindow } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

let dashboard: BrowserWindow | undefined;

export const openDashboard = async () => {
	if (dashboard) return dashboard.focus();

	dashboard = new BrowserWindow({
		width: 800,
		height: 600,
		frame: false,
		transparent: true,
		title: 'Nova Wallpaper',
		icon: 'src/assets/images/logo.png',
		webPreferences: {
			devTools: false,
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true,
		},
	});

	try {
		if (process.env.WEBPACK_DEV_SERVER_URL) {
			await dashboard.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
		} else {
			createProtocol('app');
			dashboard.loadURL('app://./index.html');
		}
	} catch {
		closeDashboard();
	}
};

export const closeDashboard = () => {
	if (dashboard) {
		dashboard.close();
		dashboard = undefined;
	}
};
