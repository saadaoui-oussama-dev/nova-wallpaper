const { contextBridge, ipcRenderer } = require('electron');

const ChannelConnector = (channel) => {
	const callbacks = {};
	return {
		on: (event, callback) => {
			callbacks[event] = callback;
			ipcRenderer.on(event, (_, ...data) => callbacks[event]?.(...data));
		},
		off: (event) => delete callbacks[event],
		send: (key, ...data) => ipcRenderer.send(channel, key, ...data),
		invoke: async (key, ...data) => await ipcRenderer.invoke(channel, key, ...data),
	};
};

contextBridge.exposeInMainWorld('NovaWallpaper', {
	dashboard: ChannelConnector('dashboard'),
	files: ChannelConnector('files'),
});
