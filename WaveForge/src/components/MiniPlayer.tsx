import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react'
import { useState } from 'react'

interface MiniPlayerProps {
  show: boolean
  coverUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  accentColor: string
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onClick: () => void
}

export default function MiniPlayer({
  show,
  coverUrl,
  isPlaying,
  currentTime,
  duration,
  accentColor,
  onPlayPause,
  onNext,
  onPrevious,
  onClick
}: MiniPlayerProps) {
  const [isHovered, setIsHovered] = useState(false)

  // 计算进度百分比
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  
  // 方形进度条的周长计算（80x80的方形）
  const size = 80  // 封面尺寸
  const strokeWidth = 3
  const perimeter = size * 4  // 方形周长
  const progressLength = (progress / 100) * perimeter

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 控制按钮药丸 - 上方弹出 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-full overflow-hidden relative"
              >
                {/* 液态玻璃背景层 */}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(15,15,25,0.85) 50%, rgba(0,0,0,0.75) 100%)',
                  backdropFilter: 'blur(60px) saturate(200%) brightness(1.1)',
                  WebkitBackdropFilter: 'blur(60px) saturate(200%) brightness(1.1)',
                }} />
                
                {/* 光泽层 */}
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                  pointerEvents: 'none',
                }} />
                
                {/* 边框 */}
                <div className="absolute inset-0 rounded-full" style={{
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
                  pointerEvents: 'none',
                }} />
                
                {/* 内容层 */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                {/* 上一曲 */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPrevious()
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <SkipBack className="w-4 h-4 text-white" fill="currentColor" />
                </motion.button>

                {/* 播放/暂停 */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlayPause()
                  }}
                  className="p-2 rounded-full transition-all group"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = accentColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="currentColor" />
                  ) : (
                    <Play className="w-5 h-5 text-white" fill="currentColor" />
                  )}
                </motion.button>

                {/* 下一曲 */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNext()
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <SkipForward className="w-4 h-4 text-white" fill="currentColor" />
                </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 封面 + 进度环 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className="relative cursor-pointer"
          >
            {/* 方形进度环 - SVG */}
            <svg 
              className="absolute -inset-[6px] w-[92px] h-[92px]" 
              viewBox="0 0 92 92"
              style={{ 
                filter: `drop-shadow(0 0 8px ${accentColor}60)`,
                pointerEvents: 'none'
              }}
            >
              {/* 背景方框 */}
              <rect
                x="6"
                y="6"
                width="80"
                height="80"
                rx="12"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* 进度方框 - 使用路径来绘制 */}
              <path
                d={`
                  M ${6 + 12} ${6}
                  L ${6 + 80 - 12} ${6}
                  Q ${6 + 80} ${6} ${6 + 80} ${6 + 12}
                  L ${6 + 80} ${6 + 80 - 12}
                  Q ${6 + 80} ${6 + 80} ${6 + 80 - 12} ${6 + 80}
                  L ${6 + 12} ${6 + 80}
                  Q ${6} ${6 + 80} ${6} ${6 + 80 - 12}
                  L ${6} ${6 + 12}
                  Q ${6} ${6} ${6 + 12} ${6}
                `}
                stroke={accentColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={perimeter}
                strokeDashoffset={perimeter - progressLength}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.3s ease',
                }}
              />
            </svg>

            {/* 封面 */}
            <div
              className="w-20 h-20 rounded-xl overflow-hidden"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              <img
                src={coverUrl}
                alt="Current playing"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
