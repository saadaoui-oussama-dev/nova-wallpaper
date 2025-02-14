const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('NovaWallpaper', {
	readJson: (filename, isArray) => ipcRenderer.invoke(`renderer-json`, 'read', filename, isArray),
	writeJson: (filename, data) => ipcRenderer.invoke(`renderer-json`, 'write', filename, data),
	execute: (permissionId) => ipcRenderer.invoke(`renderer-execute`, 'execute', permissionId),
});
