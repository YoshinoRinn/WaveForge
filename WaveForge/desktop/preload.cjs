const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 音乐平台相关
  platform: {
    searchMusic: (query) => ipcRenderer.invoke('search-music', query),
    getPlayUrl: (id, platform) => ipcRenderer.invoke('get-play-url', id, platform),
    getLyrics: (id, platform) => ipcRenderer.invoke('get-lyrics', id, platform),
  },
  
  // 文件操作
  file: {
    selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
    selectLrcFile: () => ipcRenderer.invoke('select-lrc-file'),
  },
  
  // 系统相关
  system: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
  },
})
