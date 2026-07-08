import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SlidersHorizontal, Plus, Minus, X } from 'lucide-react'

interface QuickSettingsProps {
  hasTranslation: boolean  // 当前歌曲是否有翻译
  onTranslationToggle?: (enabled: boolean) => void
  forceClose?: boolean  // 强制关闭面板
  playerTheme?: 'light' | 'dark'  // 播放器主题
}

export default function QuickSettings({ hasTranslation, onTranslationToggle, forceClose, playerTheme = 'dark' }: QuickSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // 主题色
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('accentColor')
    return saved || '#3B82F6'
  })
  
  // 监听主题色变化
  useEffect(() => {
    const handleAccentColorChange = (e: CustomEvent) => {
      setAccentColor(e.detail)
    }
    
    window.addEventListener('accentColorChanged', handleAccentColorChange as EventListener)
    
    return () => {
      window.removeEventListener('accentColorChanged', handleAccentColorChange as EventListener)
    }
  }, [])
  
  // 监听forceClose，当控件收回时关闭面板
  useEffect(() => {
    if (forceClose) {
      setIsOpen(false)
    }
  }, [forceClose])
  
  // 歌词大小 (rem)
  const [lyricSize, setLyricSize] = useState(() => {
    const saved = localStorage.getItem('lyricSize')
    return saved ? parseFloat(saved) : 2.8
  })
  
  // 歌词偏移 (秒)
  const [lyricOffset, setLyricOffset] = useState(() => {
    const saved = localStorage.getItem('lyricOffset')
    return saved ? parseFloat(saved) : 0
  })
  
  // 逐字歌词
  const [wordByWord, setWordByWord] = useState(() => {
    const saved = localStorage.getItem('wordByWordLyrics')
    return saved !== null ? JSON.parse(saved) : true
  })
  
  // 歌词高光
  const [lyricGlow, setLyricGlow] = useState(() => {
    const saved = localStorage.getItem('lyricGlow')
    return saved !== null ? JSON.parse(saved) : true
  })
  
  // 背景律动效果
  const [coverPulseEnabled, setCoverPulseEnabled] = useState(() => {
    const saved = localStorage.getItem('coverPulseEnabled')
    return saved !== null ? JSON.parse(saved) : false
  })
  
  // 主题色
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('playerTheme')
    return (saved as 'dark' | 'light') || 'dark'
  })
  
  // 背景效果
  const [backgroundEffect, setBackgroundEffect] = useState<'transparent' | 'blur' | 'immersive'>(() => {
    const saved = localStorage.getItem('backgroundEffect')
    return (saved as 'transparent' | 'blur' | 'immersive') || 'blur'
  })
  
  // 翻译开关
  const [translationEnabled, setTranslationEnabled] = useState(() => {
    const saved = localStorage.getItem('translationEnabled')
    return saved !== null ? JSON.parse(saved) : false
  })

  // 保存歌词大小
  const handleLyricSizeChange = (delta: number) => {
    const newSize = Math.max(1.5, Math.min(4.5, lyricSize + delta))
    setLyricSize(newSize)
    localStorage.setItem('lyricSize', newSize.toString())
    window.dispatchEvent(new CustomEvent('lyricSizeChanged', { detail: newSize }))
  }

  // 保存歌词偏移
  const handleLyricOffsetChange = (delta: number) => {
    const newOffset = Math.max(-5, Math.min(5, lyricOffset + delta))
    setLyricOffset(newOffset)
    localStorage.setItem('lyricOffset', newOffset.toString())
    window.dispatchEvent(new CustomEvent('lyricOffsetChanged', { detail: newOffset }))
  }

  // 保存逐字歌词
  const handleWordByWordToggle = () => {
    const newValue = !wordByWord
    setWordByWord(newValue)
    localStorage.setItem('wordByWordLyrics', JSON.stringify(newValue))
    window.dispatchEvent(new Event('wordByWordLyricsChanged'))
  }

  // 保存歌词高光
  const handleLyricGlowToggle = () => {
    const newValue = !lyricGlow
    setLyricGlow(newValue)
    localStorage.setItem('lyricGlow', JSON.stringify(newValue))
    window.dispatchEvent(new Event('lyricGlowChanged'))
  }
  
  // 保存背景律动效果
  const handleCoverPulseToggle = () => {
    const newValue = !coverPulseEnabled
    console.log('Cover pulse toggle:', newValue)
    setCoverPulseEnabled(newValue)
    localStorage.setItem('coverPulseEnabled', JSON.stringify(newValue))
    window.dispatchEvent(new CustomEvent('coverPulseChanged', { detail: newValue }))
  }

  // 保存主题色
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    localStorage.setItem('playerTheme', newTheme)
    window.dispatchEvent(new CustomEvent('playerThemeChanged', { detail: newTheme }))
  }

  // 保存背景效果
  const handleBackgroundEffectChange = (effect: 'transparent' | 'blur' | 'immersive') => {
    setBackgroundEffect(effect)
    localStorage.setItem('backgroundEffect', effect)
    window.dispatchEvent(new CustomEvent('backgroundEffectChanged', { detail: effect }))
  }

  // 保存翻译开关
  const handleTranslationToggle = () => {
    const newValue = !translationEnabled
    setTranslationEnabled(newValue)
    localStorage.setItem('translationEnabled', JSON.stringify(newValue))
    window.dispatchEvent(new Event('translationSettingsChanged'))
    if (onTranslationToggle) {
      onTranslationToggle(newValue)
    }
  }

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <motion.button
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full backdrop-blur-md border transition-colors ${
          playerTheme === 'dark'
            ? 'bg-black/40 hover:bg-black/60 border-white/20'
            : 'bg-white/40 hover:bg-white/60 border-black/20'
        }`}
      >
        <SlidersHorizontal className={`w-6 h-6 ${playerTheme === 'dark' ? 'text-white' : 'text-black'} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* 设置面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* 设置药丸 - 左下弹出 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-14 right-0 z-50 w-80 rounded-3xl overflow-hidden"
            >
              {/* 液态玻璃效果层 - 增强版 */}
              <div className="absolute inset-0" style={{
                background: playerTheme === 'dark'
                  ? 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(15,15,25,0.85) 30%, rgba(25,15,35,0.8) 70%, rgba(0,0,0,0.75) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(245,245,250,0.85) 30%, rgba(250,245,255,0.8) 70%, rgba(255,255,255,0.75) 100%)',
                backdropFilter: 'blur(60px) saturate(200%) brightness(1.1)',
                WebkitBackdropFilter: 'blur(60px) saturate(200%) brightness(1.1)',
              }} />
              
              {/* 多层光泽效果 */}
              <div className="absolute inset-0" style={{
                background: playerTheme === 'dark'
                  ? 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 85%, rgba(255,255,255,0.08) 0%, transparent 40%)'
                  : 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.9) 0%, transparent 40%), radial-gradient(circle at 80% 85%, rgba(255,255,255,0.5) 0%, transparent 40%)',
                pointerEvents: 'none',
              }} />
              
              {/* 细微噪点纹理 */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                pointerEvents: 'none',
              }} />
              
              {/* 边框高光 - 增强版 */}
              <div className="absolute inset-0 rounded-3xl" style={{
                border: playerTheme === 'dark' 
                  ? '1.5px solid rgba(255,255,255,0.2)'
                  : '1.5px solid rgba(0,0,0,0.15)',
                boxShadow: playerTheme === 'dark'
                  ? '0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.2), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(0,0,0,0.2)'
                  : '0 20px 60px rgba(0,0,0,0.2), 0 0 1px rgba(255,255,255,0.8), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(0,0,0,0.05)',
                pointerEvents: 'none',
              }} />
              
              {/* 内容层 */}
              <div className="relative p-4 space-y-3">
              {/* 标题 */}
              <div className={`flex items-center justify-between pb-2 border-b ${
                playerTheme === 'dark' ? 'border-white/10' : 'border-black/10'
              }`}>
                <h3 className={`font-semibold text-sm ${
                  playerTheme === 'dark' ? 'text-white' : 'text-black'
                }`}>播放设置</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-full transition-colors ${
                    playerTheme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'
                  }`}
                >
                  <X className={`w-4 h-4 ${
                    playerTheme === 'dark' ? 'text-white/60' : 'text-black/60'
                  }`} />
                </button>
              </div>


              {/* 歌词大小 */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${playerTheme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>歌词大小</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLyricSizeChange(-0.2)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      playerTheme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                    }`}
                  >
                    <Minus className={`w-3 h-3 ${playerTheme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </button>
                  <span className={`text-sm w-12 text-center ${playerTheme === 'dark' ? 'text-white' : 'text-black'}`}>{lyricSize.toFixed(1)}</span>
                  <button
                    onClick={() => handleLyricSizeChange(0.2)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      playerTheme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                    }`}
                  >
                    <Plus className={`w-3 h-3 ${playerTheme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </button>
                </div>
              </div>

              {/* 歌词偏移 */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${playerTheme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>歌词偏移</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLyricOffsetChange(-0.1)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      playerTheme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                    }`}
                  >
                    <Minus className={`w-3 h-3 ${playerTheme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </button>
                  <span className={`text-sm w-12 text-center ${playerTheme === 'dark' ? 'text-white' : 'text-black'}`}>{lyricOffset.toFixed(1)}</span>
                  <button
                    onClick={() => handleLyricOffsetChange(0.1)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      playerTheme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                    }`}
                  >
                    <Plus className={`w-3 h-3 ${playerTheme === 'dark' ? 'text-white' : 'text-black'}`} />
                  </button>
                </div>
              </div>

              {/* 逐字歌词 */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${playerTheme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>逐字歌词</span>
                <button
                  onClick={handleWordByWordToggle}
                  className="relative w-12 h-7 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: wordByWord 
                      ? accentColor 
                      : playerTheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                    boxShadow: wordByWord 
                      ? `0 0 12px ${accentColor}40, inset 0 1px 1px rgba(255,255,255,0.2)` 
                      : 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <motion.div
                    animate={{ 
                      x: wordByWord ? 22 : 2,
                      scale: wordByWord ? 1 : 0.9
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 bg-white rounded-full"
                    style={{
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 2px rgba(0,0,0,0.1)',
                    }}
                  />
                </button>
              </div>

              {/* 歌词高光 */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${playerTheme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>歌词高光</span>
                <button
                  onClick={handleLyricGlowToggle}
                  className="relative w-12 h-7 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: lyricGlow 
                      ? accentColor 
                      : playerTheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                    boxShadow: lyricGlow 
                      ? `0 0 12px ${accentColor}40, inset 0 1px 1px rgba(255,255,255,0.2)` 
                      : 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <motion.div
                    animate={{ 
                      x: lyricGlow ? 22 : 2,
                      scale: lyricGlow ? 1 : 0.9
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 bg-white rounded-full"
                    style={{
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 2px rgba(0,0,0,0.1)',
                    }}
                  />
                </button>
              </div>

              {/* 背景律动 */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${playerTheme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>背景律动</span>
                <button
                  onClick={handleCoverPulseToggle}
                  className="relative w-12 h-7 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: coverPulseEnabled 
                      ? accentColor 
                      : playerTheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                    boxShadow: coverPulseEnabled 
                      ? `0 0 12px ${accentColor}40, inset 0 1px 1px rgba(255,255,255,0.2)` 
                      : 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <motion.div
                    animate={{ 
                      x: coverPulseEnabled ? 22 : 2,
                      scale: coverPulseEnabled ? 1 : 0.9
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 bg-white rounded-full"
                    style={{
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 2px rgba(0,0,0,0.1)',
                    }}
                  />
                </button>
              </div>

              {/* 主题色 */}
              <div className="flex flex-col gap-2">
                <span className={`text-sm ${playerTheme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>主题色</span>
                <div className="flex gap-2">
                  {(['dark', 'light'] as const).map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => handleThemeChange(themeOption)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: theme === themeOption 
                          ? accentColor 
                          : playerTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        color: theme === themeOption 
                          ? '#fff' 
                          : playerTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                        boxShadow: theme === themeOption 
                          ? `0 0 8px ${accentColor}30` 
                          : 'none',
                      }}
                    >
                      {themeOption === 'dark' ? '深色' : '浅色'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 背景效果 */}
              <div className="flex flex-col gap-2">
                <span className={`text-sm ${playerTheme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>背景效果</span>
                <div className="flex gap-2">
                  {(['transparent', 'blur', 'immersive'] as const).map((effect) => (
                    <button
                      key={effect}
                      onClick={() => handleBackgroundEffectChange(effect)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: backgroundEffect === effect 
                          ? accentColor 
                          : playerTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        color: backgroundEffect === effect 
                          ? '#fff' 
                          : playerTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                        boxShadow: backgroundEffect === effect 
                          ? `0 0 8px ${accentColor}30` 
                          : 'none',
                      }}
                    >
                      {effect === 'transparent' ? '通透' : effect === 'blur' ? '模糊' : '沉浸'}
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
