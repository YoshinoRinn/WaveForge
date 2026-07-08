import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GripVertical, Check } from 'lucide-react'

interface HomeCustomizeModalProps {
  show: boolean
  onClose: () => void
  playerTheme?: 'light' | 'dark'
}

type HomeModuleType = 
  | 'netease_new_songs'
  | 'netease_hot_songs'
  | 'netease_rising_songs'
  | 'netease_daily_recommend'
  | 'netease_radar'
  | 'netease_playlists'
  | 'qq_guess_you_like'
  | 'qq_daily_30'
  | 'qq_playlists'

interface HomeModule {
  id: HomeModuleType
  name: string
  platform: 'netease' | 'qq'
  type: 'song-list' | 'playlist-grid'
}

const availableModules: HomeModule[] = [
  { id: 'netease_new_songs', name: '新歌榜', platform: 'netease', type: 'song-list' },
  { id: 'netease_hot_songs', name: '热歌榜', platform: 'netease', type: 'song-list' },
  { id: 'netease_rising_songs', name: '飙升榜', platform: 'netease', type: 'song-list' },
  { id: 'netease_daily_recommend', name: '每日推荐', platform: 'netease', type: 'song-list' },
  { id: 'netease_radar', name: '私人雷达', platform: 'netease', type: 'song-list' },
  { id: 'netease_playlists', name: '推荐歌单', platform: 'netease', type: 'playlist-grid' },
  { id: 'qq_guess_you_like', name: '猜你喜欢', platform: 'qq', type: 'song-list' },
  { id: 'qq_daily_30', name: '每日三十首', platform: 'qq', type: 'song-list' },
  { id: 'qq_playlists', name: '歌单推荐', platform: 'qq', type: 'playlist-grid' },
]

export default function HomeCustomizeModal({ show, onClose, playerTheme = 'dark' }: HomeCustomizeModalProps) {
  const textPrimary = playerTheme === 'dark' ? 'text-white' : 'text-black'
  const textSecondary = playerTheme === 'dark' ? 'text-white/60' : 'text-black/60'
  const textTertiary = playerTheme === 'dark' ? 'text-white/40' : 'text-black/40'
  const bgCard = playerTheme === 'dark' ? 'bg-white/5' : 'bg-black/5'
  const borderColor = playerTheme === 'dark' ? 'border-white/10' : 'border-black/10'
  
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('accentColor')
    return saved || '#3B82F6'
  })
  
  // 分平台的模块选择
  const [neteaseModules, setNeteaseModules] = useState<HomeModuleType[]>(() => {
    const saved = localStorage.getItem('homeModules_netease')
    return saved ? JSON.parse(saved) : ['netease_new_songs', 'netease_hot_songs', 'netease_rising_songs']
  })
  
  const [qqModules, setQQModules] = useState<HomeModuleType[]>(() => {
    const saved = localStorage.getItem('homeModules_qq')
    return saved ? JSON.parse(saved) : []
  })
  
  const [draggedModule, setDraggedModule] = useState<{ moduleId: HomeModuleType, platform: 'netease' | 'qq' } | null>(null)
  
  useEffect(() => {
    const handleAccentColorChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setAccentColor(customEvent.detail)
      }
    }
    window.addEventListener('accentColorChanged', handleAccentColorChange)
    return () => window.removeEventListener('accentColorChanged', handleAccentColorChange)
  }, [])
  
  const handleModuleToggle = (moduleId: HomeModuleType, platform: 'netease' | 'qq') => {
    const modules = platform === 'netease' ? neteaseModules : qqModules
    const setModules = platform === 'netease' ? setNeteaseModules : setQQModules
    
    if (modules.includes(moduleId)) {
      // 移除模块
      const newModules = modules.filter(id => id !== moduleId)
      setModules(newModules)
      localStorage.setItem(`homeModules_${platform}`, JSON.stringify(newModules))
    } else {
      // 添加模块（最多3个）
      if (modules.length >= 3) {
        alert(`${platform === 'netease' ? '网易云' : 'QQ音乐'}最多只能选择3个模块`)
        return
      }
      const newModules = [...modules, moduleId]
      setModules(newModules)
      localStorage.setItem(`homeModules_${platform}`, JSON.stringify(newModules))
    }
    
    // 触发更新事件
    window.dispatchEvent(new Event('homeModulesChanged'))
  }
  
  const handleDragStart = (moduleId: HomeModuleType, platform: 'netease' | 'qq') => {
    setDraggedModule({ moduleId, platform })
  }
  
  const handleDragOver = (e: React.DragEvent, targetModuleId: HomeModuleType, platform: 'netease' | 'qq') => {
    e.preventDefault()
    if (!draggedModule || draggedModule.platform !== platform || draggedModule.moduleId === targetModuleId) return
    
    const modules = platform === 'netease' ? neteaseModules : qqModules
    const setModules = platform === 'netease' ? setNeteaseModules : setQQModules
    
    const draggedIndex = modules.indexOf(draggedModule.moduleId)
    const targetIndex = modules.indexOf(targetModuleId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    const newModules = [...modules]
    newModules.splice(draggedIndex, 1)
    newModules.splice(targetIndex, 0, draggedModule.moduleId)
    
    setModules(newModules)
  }
  
  const handleDragEnd = () => {
    if (draggedModule) {
      const platform = draggedModule.platform
      const modules = platform === 'netease' ? neteaseModules : qqModules
      localStorage.setItem(`homeModules_${platform}`, JSON.stringify(modules))
      window.dispatchEvent(new Event('homeModulesChanged'))
      setDraggedModule(null)
    }
  }
  
  const neteaseAvailableModules = availableModules.filter(m => m.platform === 'netease')
  const qqAvailableModules = availableModules.filter(m => m.platform === 'qq')
  
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          
          {/* 弹窗 */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg z-[70] shadow-2xl overflow-hidden"
            style={{
              background: playerTheme === 'dark' 
                ? 'linear-gradient(135deg, rgba(30, 30, 40, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(250, 250, 250, 0.98) 0%, rgba(240, 240, 240, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* 头部 */}
            <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>首页自定义</h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${bgCard} hover:bg-white/10`}
              >
                <X className={`w-5 h-5 ${textPrimary}`} />
              </button>
            </div>
            
            {/* 内容区 */}
            <div className="overflow-y-auto h-[calc(100%-88px)] p-6" style={{ scrollbarWidth: 'thin' }}>
              <p className={`${textSecondary} text-sm mb-6`}>
                分别为网易云音乐和QQ音乐选择最多3个模块，支持拖拽排序
              </p>
              
              {/* 网易云音乐部分 */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-red-600 rounded-lg"></div>
                  <h3 className={`text-lg font-bold ${textPrimary}`}>网易云音乐</h3>
                  <span className={`text-xs ${textTertiary}`}>
                    ({neteaseModules.length}/3)
                  </span>
                </div>
                
                {/* 已选择的模块 */}
                {neteaseModules.length > 0 && (
                  <div className="mb-4">
                    <div className={`${textSecondary} text-xs mb-2`}>已选择（拖拽排序）：</div>
                    <div className="space-y-2">
                      {neteaseModules.map((moduleId) => {
                        const module = availableModules.find(m => m.id === moduleId)
                        if (!module) return null
                        return (
                          <div
                            key={moduleId}
                            draggable
                            onDragStart={() => handleDragStart(moduleId, 'netease')}
                            onDragOver={(e) => handleDragOver(e, moduleId, 'netease')}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-move transition-all ${
                              draggedModule?.moduleId === moduleId ? 'opacity-50' : ''
                            }`}
                            style={{
                              backgroundColor: `${accentColor}15`,
                              borderLeft: `3px solid ${accentColor}`
                            }}
                          >
                            <GripVertical className="w-4 h-4" style={{ color: accentColor }} />
                            <div className="flex-1">
                              <span className={`${textPrimary} text-sm font-medium`}>{module.name}</span>
                              {module.type === 'playlist-grid' && (
                                <span className={`${textTertiary} text-xs ml-2`}>(歌单网格)</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleModuleToggle(moduleId, 'netease')}
                              className={`px-3 py-1 text-xs rounded-full ${textSecondary} transition-colors`}
                              style={{ backgroundColor: `${accentColor}20` }}
                            >
                              移除
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* 可选模块 */}
                <div className="space-y-2">
                  {neteaseAvailableModules.map(module => {
                    const isSelected = neteaseModules.includes(module.id)
                    return (
                      <button
                        key={module.id}
                        onClick={() => handleModuleToggle(module.id, 'netease')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                          isSelected
                            ? bgCard
                            : `${bgCard} hover:bg-white/10`
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all`}
                          style={{
                            borderColor: isSelected ? accentColor : playerTheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                            backgroundColor: isSelected ? accentColor : 'transparent'
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`${textPrimary} text-sm font-medium`}>{module.name}</span>
                        {module.type === 'playlist-grid' && (
                          <span className={`${textTertiary} text-xs`}>(歌单网格)</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* QQ音乐部分 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-green-600 rounded-lg"></div>
                  <h3 className={`text-lg font-bold ${textPrimary}`}>QQ音乐</h3>
                  <span className={`text-xs ${textTertiary}`}>
                    ({qqModules.length}/3)
                  </span>
                </div>
                
                {/* 已选择的模块 */}
                {qqModules.length > 0 && (
                  <div className="mb-4">
                    <div className={`${textSecondary} text-xs mb-2`}>已选择（拖拽排序）：</div>
                    <div className="space-y-2">
                      {qqModules.map((moduleId) => {
                        const module = availableModules.find(m => m.id === moduleId)
                        if (!module) return null
                        return (
                          <div
                            key={moduleId}
                            draggable
                            onDragStart={() => handleDragStart(moduleId, 'qq')}
                            onDragOver={(e) => handleDragOver(e, moduleId, 'qq')}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-move transition-all ${
                              draggedModule?.moduleId === moduleId ? 'opacity-50' : ''
                            }`}
                            style={{
                              backgroundColor: `${accentColor}15`,
                              borderLeft: `3px solid ${accentColor}`
                            }}
                          >
                            <GripVertical className="w-4 h-4" style={{ color: accentColor }} />
                            <div className="flex-1">
                              <span className={`${textPrimary} text-sm font-medium`}>{module.name}</span>
                              {module.type === 'playlist-grid' && (
                                <span className={`${textTertiary} text-xs ml-2`}>(歌单网格)</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleModuleToggle(moduleId, 'qq')}
                              className={`px-3 py-1 text-xs rounded-full ${textSecondary} transition-colors`}
                              style={{ backgroundColor: `${accentColor}20` }}
                            >
                              移除
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* 可选模块 */}
                <div className="space-y-2">
                  {qqAvailableModules.map(module => {
                    const isSelected = qqModules.includes(module.id)
                    return (
                      <button
                        key={module.id}
                        onClick={() => handleModuleToggle(module.id, 'qq')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                          isSelected
                            ? bgCard
                            : `${bgCard} hover:bg-white/10`
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all`}
                          style={{
                            borderColor: isSelected ? accentColor : playerTheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                            backgroundColor: isSelected ? accentColor : 'transparent'
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`${textPrimary} text-sm font-medium`}>{module.name}</span>
                        {module.type === 'playlist-grid' && (
                          <span className={`${textTertiary} text-xs`}>(歌单网格)</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
