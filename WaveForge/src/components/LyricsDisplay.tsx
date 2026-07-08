import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface LyricWord {
  word: string
  startTime: number
  duration: number
}

interface LyricLine {
  time: number
  text: string
  words?: LyricWord[]
  translation?: string
}

interface LyricsDisplayProps {
  currentTime: number
  isPlaying: boolean
  accentColor: string
  lyrics?: LyricLine[]
  translationEnabled?: boolean
  translationPosition?: 'traditional' | 'bottom-right'
  onCurrentTranslationChange?: (translation: string) => void
  onSeek?: (time: number) => void
}

export default function LyricsDisplay({ 
  currentTime, 
  isPlaying, 
  accentColor, 
  lyrics,
  translationEnabled = false,
  translationPosition = 'traditional',
  onCurrentTranslationChange,
  onSeek
}: LyricsDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [manualScrollOffset, setManualScrollOffset] = useState(0) // 手动滚动的偏移量（行数）
  const [isManualScrolling, setIsManualScrolling] = useState(false)
  const [isJumping, setIsJumping] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null)
  const [blinkingIndex, setBlinkingIndex] = useState<number | null>(null) // 闪烁的歌词行
  const [showGlassFrame, setShowGlassFrame] = useState(false)
  const [returnTimer, setReturnTimer] = useState<NodeJS.Timeout | null>(null) // 自动返回计时器
  const [wordByWordEnabled, setWordByWordEnabled] = useState(() => {
    const saved = localStorage.getItem('wordByWordLyrics')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [lyricSize, setLyricSize] = useState(() => {
    const saved = localStorage.getItem('lyricSize')
    return saved ? parseFloat(saved) : 2.8
  })
  const [lyricGlow, setLyricGlow] = useState(() => {
    const saved = localStorage.getItem('lyricGlow')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [lyricOffset, setLyricOffset] = useState(() => {
    const saved = localStorage.getItem('lyricOffset')
    return saved ? parseFloat(saved) : 0
  })
  const [animationMode, setAnimationMode] = useState<'elegant' | 'normal' | 'dynamic'>(() => {
    const saved = localStorage.getItem('animationMode')
    return (saved as 'elegant' | 'normal' | 'dynamic') || 'elegant'
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const displayLyricsData = lyrics || []
  
  // 处理鼠标滚轮滚动
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    // 跳转期间禁用滚动
    if (isJumping) return
    
    setIsManualScrolling(true)
    setManualScrollOffset(prev => {
      const delta = e.deltaY / 100 // 每100px滚动1行
      const newOffset = prev + delta
      
      // 限制滚动范围：不能滚动到第一句之前，也不能滚动到最后一句之后
      // 当前播放索引 + 手动偏移 = 实际显示的中心位置
      const targetIndex = currentIndex + newOffset
      
      if (targetIndex < 0) {
        // 不能滚动到第一句之前
        return -currentIndex
      } else if (targetIndex >= displayLyricsData.length - 1) {
        // 不能滚动到最后一句之后
        return displayLyricsData.length - 1 - currentIndex
      }
      
      return newOffset
    })
    
    // 清除之前的滚动计时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
    // 清除自动返回计时器
    if (returnTimer) {
      clearTimeout(returnTimer)
      setReturnTimer(null)
    }
  }
  
  // 处理容器鼠标移出
  const handleContainerMouseLeave = () => {
    // 容器鼠标移出时，启动3秒返回计时器
    if (isManualScrolling) {
      if (returnTimer) {
        clearTimeout(returnTimer)
      }
      const timer = setTimeout(() => {
        setIsManualScrolling(false)
        setManualScrollOffset(0)
      }, 3000)
      setReturnTimer(timer)
    }
  }
  
  // 处理歌词悬停
  const handleLyricMouseEnter = (index: number) => {
    setHoveredIndex(index)
    setShowGlassFrame(false)
    setBlinkingIndex(null)
    
    // 清除滚动返回计时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
    
    // 清除自动返回计时器
    if (returnTimer) {
      clearTimeout(returnTimer)
      setReturnTimer(null)
    }
    
    // 清除之前的悬停计时器
    if (hoverTimer) {
      clearTimeout(hoverTimer)
    }
    
    // 只在滚动模式下启用2秒后闪烁功能
    if (isManualScrolling) {
      const timer = setTimeout(() => {
        setBlinkingIndex(index)
      }, 2000)
      
      setHoverTimer(timer)
    }
  }
  
  // 处理歌词移出
  const handleLyricMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      setHoverTimer(null)
    }
    setShowGlassFrame(false)
    setBlinkingIndex(null)
    
    setTimeout(() => {
      setHoveredIndex(null)
    }, 300)
    
    // 鼠标移出后，3秒后自动回到当前播放位置
    if (isManualScrolling) {
      if (returnTimer) {
        clearTimeout(returnTimer)
      }
      const timer = setTimeout(() => {
        setIsManualScrolling(false)
        setManualScrollOffset(0)
      }, 3000)
      setReturnTimer(timer)
    }
  }
  
  // 处理点击跳转
  const handleLyricClick = (time: number, targetIndex: number) => {
    if (onSeek && time >= 0) {
      onSeek(time)
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
      if (hoverTimer) {
        clearTimeout(hoverTimer)
        setHoverTimer(null)
      }
      if (returnTimer) {
        clearTimeout(returnTimer)
        setReturnTimer(null)
      }
      
      setShowGlassFrame(false)
      setHoveredIndex(null)
      setBlinkingIndex(null)
      
      // 设置跳转标志，启用跳转动画
      setIsJumping(true)
      
      // 如果在滚动模式下，先清除滚动状态再跳转
      if (isManualScrolling) {
        setIsManualScrolling(false)
        setManualScrollOffset(0)
        
        // 等待动画完成后再清除跳转标志
        setTimeout(() => {
          setIsJumping(false)
        }, 600)
      } else {
        // 播放模式下直接跳转
        // 600ms后清除跳转标志
        setTimeout(() => {
          setIsJumping(false)
        }, 600)
      }
    }
  }
  
  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('wordByWordLyrics')
      setWordByWordEnabled(saved !== null ? JSON.parse(saved) : true)
    }
    
    const handleLyricSizeChange = (e: Event) => {
      const customEvent = e as CustomEvent
      setLyricSize(customEvent.detail)
    }
    
    const handleLyricGlowChange = () => {
      const saved = localStorage.getItem('lyricGlow')
      setLyricGlow(saved !== null ? JSON.parse(saved) : true)
    }
    
    const handleLyricOffsetChange = (e: Event) => {
      const customEvent = e as CustomEvent
      setLyricOffset(customEvent.detail)
    }
    
    const handleAnimationModeChange = (e: Event) => {
      const customEvent = e as CustomEvent
      setAnimationMode(customEvent.detail)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('wordByWordLyricsChanged', handleStorageChange)
    window.addEventListener('lyricSizeChanged', handleLyricSizeChange as EventListener)
    window.addEventListener('lyricGlowChanged', handleLyricGlowChange)
    window.addEventListener('lyricOffsetChanged', handleLyricOffsetChange as EventListener)
    window.addEventListener('animationModeChanged', handleAnimationModeChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('wordByWordLyricsChanged', handleStorageChange)
      window.removeEventListener('lyricSizeChanged', handleLyricSizeChange as EventListener)
      window.removeEventListener('lyricGlowChanged', handleLyricGlowChange)
      window.removeEventListener('lyricOffsetChanged', handleLyricOffsetChange as EventListener)
      window.removeEventListener('animationModeChanged', handleAnimationModeChange as EventListener)
    }
  }, [])
  
  // 当歌词数据变化时，重置索引
  useEffect(() => {
    setCurrentIndex(0)
  }, [lyrics])

  // 优化歌词索引计算
  useEffect(() => {
    if (displayLyricsData.length === 0) return
    
    // 应用歌词偏移
    const adjustedTime = currentTime + 0.5 + lyricOffset
    
    for (let i = displayLyricsData.length - 1; i >= 0; i--) {
      if (adjustedTime >= displayLyricsData[i].time) {
        if (currentIndex !== i) {
          setCurrentIndex(i)
          // 通知父组件当前翻译
          if (onCurrentTranslationChange && displayLyricsData[i].translation) {
            onCurrentTranslationChange(displayLyricsData[i].translation)
          }
        }
        break
      }
    }
  }, [currentTime, displayLyricsData, currentIndex, onCurrentTranslationChange, lyricOffset])

  if (!lyrics || lyrics.length === 0) {
    return null
  }

  // 始终显示所有歌词，不裁剪
  const displayLyrics = displayLyricsData

  // 优化的逐字渲染
  const renderLyricLine = (lyric: LyricLine, isCurrent: boolean) => {
    if (wordByWordEnabled && isCurrent && lyric.words && lyric.words.length > 0) {
      const currentMs = currentTime * 1000
      
      return (
        <span className="inline-flex flex-wrap gap-1">
          {lyric.words.map((word, wordIndex) => {
            const wordAbsStartTime = word.startTime
            const wordAbsEndTime = wordAbsStartTime + word.duration
            
            const isCompleted = currentMs >= wordAbsEndTime
            const isActive = currentMs >= wordAbsStartTime && currentMs < wordAbsEndTime
            
            // 计算进度（用于更平滑的过渡）
            let progress = 0
            if (isCompleted) {
              progress = 1
            } else if (isActive) {
              progress = Math.min(Math.max((currentMs - wordAbsStartTime) / word.duration, 0), 1)
            }
            
            return (
              <motion.span
                key={wordIndex}
                className="inline-block relative"
                initial={false}
                animate={{
                  scale: isActive ? 1.18 : 1,
                  color: isCompleted || isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                }}
                transition={{
                  scale: {
                    duration: 0.2,
                    ease: [0.34, 1.56, 0.64, 1], // Apple Music 弹性缓动
                  },
                  color: {
                    duration: 0.15,
                    ease: 'easeOut',
                  },
                  fontWeight: {
                    duration: 0.1,
                  }
                }}
                style={{
                  textShadow: isActive && lyricGlow
                    ? `0 0 40px ${accentColor}ff, 0 0 80px ${accentColor}cc, 0 0 120px ${accentColor}66, 0 6px 30px rgba(0,0,0,0.9)` 
                    : isCompleted && lyricGlow
                    ? `0 0 20px ${accentColor}66, 0 3px 10px rgba(0,0,0,0.6)`
                    : '0 2px 4px rgba(0,0,0,0.3)',
                  transformOrigin: 'center center',
                  filter: isActive && lyricGlow ? `brightness(1.3) saturate(1.4)` : 'none',
                  WebkitTextStroke: isActive && lyricGlow ? '0.3px rgba(255, 255, 255, 0.15)' : 'none',
                }}
              >
                {word.word}
              </motion.span>
            )
          })}
        </span>
      )
    }
    
    return lyric.text
  }

  // 根据动画模式获取过渡配置
  const getTransitionConfig = () => {
    switch (animationMode) {
      case 'elegant':
        // 优雅：正在播放→已播是渐隐，未播→正在播是逐渐显现
        return {
          layout: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
          opacity: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          y: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
          fontSize: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
          fontWeight: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        }
      case 'normal':
        // 普通：常规的效果
        return {
          layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
          opacity: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
          y: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
          scale: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
          fontSize: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
          fontWeight: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        }
      case 'dynamic':
        // 灵动：更有活力的过渡效果
        return {
          layout: { duration: 0.35, ease: [0.68, -0.55, 0.265, 1.55] },
          opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.35, ease: [0.68, -0.55, 0.265, 1.55] },
          scale: { duration: 0.3, ease: [0.68, -0.55, 0.265, 1.55] },
          fontSize: { duration: 0.35, ease: [0.68, -0.55, 0.265, 1.55] },
          fontWeight: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
        }
    }
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-[500px] relative overflow-hidden pl-8"
      onWheel={handleWheel}
      onMouseLeave={handleContainerMouseLeave}
    >
      {/* 歌词滚动容器 */}
      <div 
        className="absolute inset-0 flex flex-col items-start justify-start"
        style={{
          paddingTop: '120px',
          paddingBottom: '400px',
          transform: (() => {
            // 计算实际显示的索引位置
            const displayIndex = isManualScrolling 
              ? currentIndex + manualScrollOffset 
              : currentIndex
            
            // 限制显示索引，避免超出范围
            const clampedIndex = Math.max(0, Math.min(displayIndex, displayLyricsData.length - 1))
            
            // 计算最大可滚动的索引，避免最后几句歌词上移过多
            // 当剩余歌词少于4句时，停止上移
            const maxScrollIndex = Math.max(0, displayLyricsData.length - 4)
            const limitedIndex = Math.min(clampedIndex, maxScrollIndex)
            
            return `translateY(${-limitedIndex * 80}px)`
          })(),
          transition: isJumping 
            ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {displayLyrics.map((lyric, index) => {
          const globalIndex = index
          const isCurrent = globalIndex === currentIndex
          const isPast = globalIndex < currentIndex
          const isFuture = globalIndex > currentIndex
          const isHovered = hoveredIndex === globalIndex
          
          // 计算与当前播放行的距离
          const distanceFromCurrent = Math.abs(globalIndex - currentIndex)
          
          const isBlinking = blinkingIndex === globalIndex
          
          // 透明度计算：当前播放行始终高亮，无论是否在滚动模式
          let opacityValue = 0.3
          
          if (isCurrent) {
            // 当前播放行始终保持高亮
            opacityValue = 1.0
          } else if (distanceFromCurrent === 1) {
            // 紧邻的上下句
            opacityValue = 0.7
          } else if (distanceFromCurrent === 2) {
            // 再外一层
            opacityValue = 0.5
          }
          
          // 如果在滚动模式下，其他行的透明度统一设置为0.5
          if (isManualScrolling && !isCurrent) {
            opacityValue = Math.max(opacityValue, 0.5)
          }
          
          return (
            <motion.div
              key={`${lyric.time}-${globalIndex}`}
              className="text-left max-w-4xl relative mb-6 pointer-events-auto cursor-pointer"
              onMouseEnter={() => handleLyricMouseEnter(globalIndex)}
              onMouseLeave={handleLyricMouseLeave}
              onClick={() => handleLyricClick(lyric.time, globalIndex)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isBlinking ? [opacityValue, 0.95, opacityValue] : opacityValue,
                y: 0 
              }}
              transition={{ 
                opacity: isBlinking 
                  ? { duration: 2.0, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }
                  : { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                y: { duration: 0.3 }
              }}
            >
              {/* 液态玻璃框 */}
              <AnimatePresence>
                {isHovered && showGlassFrame && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    className="absolute inset-0 -m-4 rounded-2xl pointer-events-none z-0"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border: `1px solid ${accentColor}40`,
                      boxShadow: `
                        0 0 0 1px ${accentColor}20,
                        0 8px 32px ${accentColor}30,
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                      `,
                    }}
                  >
                    {/* 内部高光 */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-50"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${accentColor}30, transparent 70%)`,
                      }}
                    />
                    {/* 流动效果 */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{
                        background: [
                          `linear-gradient(45deg, ${accentColor}00, ${accentColor}20, ${accentColor}00)`,
                          `linear-gradient(225deg, ${accentColor}00, ${accentColor}20, ${accentColor}00)`,
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.p
                className="font-medium leading-relaxed break-words relative z-10"
                initial={false}
                animate={{
                  fontSize: isCurrent 
                    ? `${lyricSize}rem` 
                    : `${lyricSize * 0.57}rem`,
                  fontWeight: isCurrent ? 700 : 400,
                  scale: isBlinking ? [1, 1.015, 1] : 1,
                }}
                transition={{
                  fontSize: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                  fontWeight: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                  scale: isBlinking 
                    ? { duration: 2.0, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }
                    : { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
                }}
                style={{
                  color: isCurrent
                    ? '#ffffff' 
                    : isBlinking
                    ? 'rgba(255, 255, 255, 0.85)'
                    : 'rgba(255, 255, 255, 0.5)',
                  textShadow: isCurrent && !lyric.words && lyricGlow
                    ? `0 0 60px ${accentColor}cc, 0 0 100px ${accentColor}80, 0 0 140px ${accentColor}40, 0 6px 30px rgba(0,0,0,0.9)` 
                    : isBlinking
                    ? `0 0 50px ${accentColor}dd, 0 0 80px ${accentColor}99, 0 0 120px ${accentColor}55, 0 4px 20px rgba(0,0,0,0.7)`
                    : '0 2px 4px rgba(0,0,0,0.3)',
                  filter: isCurrent && lyricGlow 
                    ? 'brightness(1.2) saturate(1.1)' 
                    : isBlinking
                    ? 'brightness(1.15) saturate(1.2)'
                    : 'none',
                  WebkitTextStroke: isCurrent && lyricGlow ? '0.5px rgba(255, 255, 255, 0.1)' : 'none',
                }}
              >
                {renderLyricLine(lyric, isCurrent)}
              </motion.p>
              
              {/* 传统位置的翻译 */}
              {translationEnabled && translationPosition === 'traditional' && lyric.translation && isCurrent && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/60 text-lg mt-3 font-light italic relative z-10"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    letterSpacing: '0.02em',
                    paddingLeft: '0.5rem',
                    borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {lyric.translation}
                </motion.p>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
