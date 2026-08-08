const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nexusDesktop", Object.freeze({
  platform: process.platform,
  exportProgress: (payload) => ipcRenderer.invoke("progress:export", payload),
  importProgress: () => ipcRenderer.invoke("progress:import"),
  exportMarathon: (payload) => ipcRenderer.invoke("marathon:export", payload),
  importMarathon: () => ipcRenderer.invoke("marathon:import"),
  authGet: (key) => ipcRenderer.invoke("auth:get", key),
  authSet: (key, value) => ipcRenderer.invoke("auth:set", key, value),
  authRemove: (key) => ipcRenderer.invoke("auth:remove", key),
  cloudSaveSnapshot: (profileId, snapshot) => ipcRenderer.invoke("cloud:snapshot-save", profileId, snapshot),
  cloudLoadSnapshot: (profileId) => ipcRenderer.invoke("cloud:snapshot-load", profileId),
  cloudQueueMutation: (mutation) => ipcRenderer.invoke("cloud:mutation-add", mutation),
  cloudPendingMutations: () => ipcRenderer.invoke("cloud:mutation-list"),
  cloudCompleteMutation: (id) => ipcRenderer.invoke("cloud:mutation-complete", id),
}));
