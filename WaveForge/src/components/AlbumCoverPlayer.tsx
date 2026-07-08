import { motion } from 'framer-motion'

interface AlbumCoverPlayerProps {
  coverUrl: string
  isPlaying: boolean
  dominantColor: string | null
}

export default function AlbumCoverPlayer({ coverUrl, isPlaying, dominantColor }: AlbumCoverPlayerProps) {
  // 使用本地 SVG 占位图
  const defaultCover = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg=='
  
  const validCoverUrl = coverUrl && coverUrl.trim() !== '' ? coverUrl : defaultCover

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 封面阴影/光晕效果 */}
      <div 
        className="absolute inset-0 blur-3xl opacity-50 rounded-3xl"
        style={{
          background: dominantColor || '#333',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* 封面图片 - 移除所有动画效果 */}
      <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={validCoverUrl}
          alt="Album Cover"
          className="w-96 h-96 object-cover"
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('封面加载失败:', validCoverUrl)
            // 使用 data URI 避免再次触发错误
            e.currentTarget.src = defaultCover
          }}
        />
      </div>
    </motion.div>
  )
}
