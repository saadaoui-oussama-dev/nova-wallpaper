const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
	'NovaWallpaper',
	Object.fromEntries(
		['window', 'files', 'json', 'database'].map((name) => {
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
				send: (key, ...data) => ipcRenderer.send(`vue-${name}`, key, ...data),
				invoke: async (key, ...data) => await ipcRenderer.invoke(`vue-${name}`, key, ...data),
			};
			return [name, channel];
		})
	)
);
