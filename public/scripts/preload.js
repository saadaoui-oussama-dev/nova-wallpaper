const { contextBridge, ipcRenderer } = require('electron');

const ChannelConnector = (channel) => {
	const callbacks = {};
	return {
		on: (event, callback) => {
			if (callbacks[event]) ipcRenderer.off(event, callbacks[event]);
			callbacks[event] = (_, key, ...data) => key === channel && callback(...data);
			ipcRenderer.on(event, callbacks[event]);
		},
		off: (event) => {
			if (callbacks[event]) ipcRenderer.off(event, callbacks[event]);
			delete callbacks[event];
		},
		send: (key, ...data) => ipcRenderer.send(channel, key, ...data),
		invoke: async (key, ...data) => await ipcRenderer.invoke(channel, key, ...data),
	};
};

contextBridge.exposeInMainWorld('NovaWallpaper', {
	window: ChannelConnector('window'),
	files: ChannelConnector('files'),
	json: ChannelConnector('json'),
	database: ChannelConnector('database'),
});
