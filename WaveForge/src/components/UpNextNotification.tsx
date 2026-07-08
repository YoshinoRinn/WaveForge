import { motion, AnimatePresence } from 'framer-motion'
import { Song, getProxiedImageUrl } from '../services/musicApi'

interface UpNextNotificationProps {
  show: boolean
  nextSong: Song
  secondsRemaining: number
}

export default function UpNextNotification({ show, nextSong, secondsRemaining }: UpNextNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -50, x: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-6 right-6 z-50"
        >
          <div 
            className="rounded-2xl border p-4 shadow-2xl min-w-[320px]"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(60px) saturate(180%)',
              WebkitBackdropFilter: 'blur(60px) saturate(180%)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-4">
              {/* 封面 */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 shadow-lg">
                {nextSong.album?.picUrl ? (
                  <img 
                    src={getProxiedImageUrl(nextSong.album.picUrl)} 
                    alt={nextSong.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/60 mb-1 font-medium">
                  即将播放 · {Math.ceil(secondsRemaining)}秒后
                </div>
                <div className="text-white font-semibold truncate text-base">
                  {nextSong.name}
                </div>
                <div className="text-white/70 text-sm truncate">
                  {nextSong.artists.map(a => a.name).join(', ')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
