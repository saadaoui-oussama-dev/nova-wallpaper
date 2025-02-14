const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('NovaWallpaper', {
	execute: (permissionId) => ipcRenderer.invoke(`renderer-execute`, 'execute', permissionId),
});
