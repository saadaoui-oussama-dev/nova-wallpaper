const { contextBridge, ipcRenderer } = require('electron');

const Channel = (name) => {
	const callbacks = {};
	const channel = {
		on: (event, callback) => {
			if (callbacks[event]) ipcRenderer.off(event, callbacks[event]);
			callbacks[event] = (_, key, ...data) => key === name && callback(...data);
			ipcRenderer.on(event, callbacks[event]);
		},
		off: (event) => {
			if (callbacks[event]) ipcRenderer.off(event, callbacks[event]);
			delete callbacks[event];
		},
		send: (key, ...data) => ipcRenderer.send(`dashboard-${name}`, key, ...data),
		invoke: async (key, ...data) => await ipcRenderer.invoke(`dashboard-${name}`, key, ...data),
	};
	return [name, channel];
};

contextBridge.exposeInMainWorld(
	'NovaWallpaper',
	Object.fromEntries(['window', 'files', 'json', 'database'].map(Channel))
);
