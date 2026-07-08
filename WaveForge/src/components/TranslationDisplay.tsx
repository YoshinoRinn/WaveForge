import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface TranslationDisplayProps {
  translation: string
  show: boolean
}

export default function TranslationDisplay({ translation, show }: TranslationDisplayProps) {
  return (
    <AnimatePresence>
      {show && translation && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-8 right-8 z-30 max-w-md"
          style={{ left: 'calc(50% + 340px)' }} // 在进度条药丸右侧
        >
          <div
            className="rounded-2xl border p-4 shadow-2xl"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="text-white/90 text-base leading-relaxed">
              {translation}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
