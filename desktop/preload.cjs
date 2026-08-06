const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexusDesktop", Object.freeze({
  platform: process.platform,
  exportProgress: (payload) => ipcRenderer.invoke("progress:export", payload),
  importProgress: () => ipcRenderer.invoke("progress:import"),
}));
