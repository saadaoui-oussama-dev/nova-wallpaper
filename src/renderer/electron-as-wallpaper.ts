import bindings from 'bindings';
import { joinPublic } from '@/global/utils';
import { processType } from '@/process';

type AttachOptions = {
	transparent: boolean;
	forwardMouseInput: boolean;
	forwardKeyboardInput: boolean;
};

type BrowserWindow = Electron.BrowserWindow & { wallpaperState?: AttachOptions & { attached: boolean } };

const neon = bindings({ bindings: 'neon', module_root: joinPublic('@/public/build/electron-as-wallpaper') });

export const attach = (window: BrowserWindow, options: Partial<AttachOptions>) => {
	const attachOptions: AttachOptions = {
		transparent: !!options.transparent || false,
		forwardMouseInput: !!options.forwardMouseInput || false,
		forwardKeyboardInput: !!options.forwardKeyboardInput || false,
	};
	if (processType === 'both') {
		attachOptions.forwardMouseInput = false;
		attachOptions.forwardKeyboardInput = false;
	}
	window.wallpaperState = { ...attachOptions, attached: true };
	neon.attach(window.getNativeWindowHandle().readUInt32LE(0), attachOptions);
};

export const detach = (window: BrowserWindow) => {
	if (!window.wallpaperState || !window.wallpaperState.attached) return;
	neon.detach(window.getNativeWindowHandle().readUInt32LE(0), {
		transparent: window.wallpaperState.transparent || false,
		forwardMouseInput: window.wallpaperState.forwardMouseInput || false,
		forwardKeyboardInput: window.wallpaperState.forwardKeyboardInput || false,
	});
	delete window.wallpaperState;
};

export const reset = () => neon.reset();
