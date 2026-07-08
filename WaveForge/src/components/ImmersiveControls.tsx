import { motion } from 'framer-motion'
import { Home, Languages } from 'lucide-react'
import { useState, useEffect } from 'react'
import QuickSettings from './QuickSettings'

interface ImmersiveControlsProps {
  onHomeClick: () => void
  onTranslationToggle: () => void
  translationEnabled: boolean
  hasTranslation: boolean
  playerTheme?: 'light' | 'dark'
}

export default function ImmersiveControls({ onHomeClick, onTranslationToggle, translationEnabled, hasTranslation, playerTheme = 'dark' }: ImmersiveControlsProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  
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

  useEffect(() => {
    // 3秒后自动隐藏
    const hideTimer = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false)
      }
    }, 3000)

    return () => clearTimeout(hideTimer)
  }, [isHovered])

  useEffect(() => {
    // 当鼠标离开后3秒自动隐藏
    if (!isHovered) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)

      return () => clearTimeout(hideTimer)
    }
  }, [isHovered])

  const handleMouseEnter = () => {
    setIsHovered(true)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div
      className="fixed top-6 right-0 z-40"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: '120px', height: hasTranslation ? '200px' : '150px' }}
    >
      {/* Home按钮 */}
      <motion.button
        initial={{ x: 0, opacity: 1 }}
        animate={{
          x: isVisible ? 0 : 60,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 0.8,
        }}
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={onHomeClick}
        className={`absolute top-0 right-6 p-3 rounded-full backdrop-blur-md border transition-colors ${
          playerTheme === 'dark'
            ? 'bg-black/40 hover:bg-black/60 border-white/20'
            : 'bg-white/50 hover:bg-white/70 border-black/20'
        }`}
      >
        <Home className={`w-6 h-6 ${playerTheme === 'dark' ? 'text-white' : 'text-black'}`} />
      </motion.button>

      {/* 翻译按钮 - 只在有翻译时显示 */}
      {hasTranslation && (
        <motion.button
          key="translation-button"
          initial={{ x: 60, opacity: 0 }}
          animate={{
            x: isVisible ? 0 : 60,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
            mass: 0.8,
          }}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={onTranslationToggle}
          className="absolute top-16 right-6 p-3 rounded-full backdrop-blur-md border transition-all overflow-hidden"
          style={{
            backgroundColor: translationEnabled
              ? accentColor
              : playerTheme === 'dark' 
                ? 'rgba(0,0,0,0.4)' 
                : 'rgba(255,255,255,0.5)',
            borderColor: translationEnabled
              ? `${accentColor}66`
              : playerTheme === 'dark'
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(0,0,0,0.2)',
            boxShadow: translationEnabled
              ? `0 0 20px ${accentColor}40, inset 0 1px 1px rgba(255,255,255,0.3)`
              : '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* 液态玻璃光泽层 */}
          {translationEnabled && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)',
              }}
            />
          )}
          <Languages 
            className="w-6 h-6 relative z-10" 
            style={{
              color: translationEnabled ? '#fff' : playerTheme === 'dark' ? '#fff' : '#000'
            }}
          />
        </motion.button>
      )}

      {/* 快速设置按钮 */}
      <motion.div
        initial={{ x: 0, opacity: 1 }}
        animate={{
          x: isVisible ? 0 : 60,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
          mass: 0.8,
          delay: 0.1,
        }}
        className={`absolute ${hasTranslation ? 'top-32' : 'top-16'} right-6`}
      >
        <QuickSettings 
          hasTranslation={hasTranslation}
          onTranslationToggle={onTranslationToggle}
          forceClose={!isVisible}
          playerTheme={playerTheme}
        />
      </motion.div>
    </div>
  )
}
