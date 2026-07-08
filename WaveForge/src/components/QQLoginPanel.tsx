import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music, ExternalLink, Copy, Check } from 'lucide-react'

interface QQLoginPanelProps {
  onClose: () => void
  onLoginSuccess: (cookie: string) => void
}

export default function QQLoginPanel({ onClose, onLoginSuccess }: QQLoginPanelProps) {
  const [cookie, setCookie] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleOpenQQMusic = () => {
    window.open('https://y.qq.com', '_blank')
  }

  const copyInstructions = async () => {
    const instructions = `1. 按F12打开开发者工具
2. 切换到Console标签
3. 输入以下代码并回车：
document.cookie

4. 复制输出的内容`
    
    try {
      await navigator.clipboard.writeText(instructions)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const handleLogin = async () => {
    if (!cookie.trim()) {
      setError('请输入Cookie')
      return
    }

    try {
      // 验证Cookie格式（简单检查是否包含关键字段）
      if (!cookie.includes('uin') && !cookie.includes('qm_keyst') && !cookie.includes('qqmusic_key')) {
        setError('Cookie格式不正确，请确保包含完整的Cookie信息')
        return
      }

      // 发送到后端验证
      const res = await fetch('http://localhost:3001/api/qq/user/setCookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: cookie }),
      })

      const result = await res.json()
      
      if (result.result === 100) {
        onLoginSuccess(cookie)
      } else {
        setError('登录失败，请检查Cookie是否有效')
      }
    } catch (err) {
      console.error('登录错误:', err)
      setError('登录失败，请重试')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl p-8 border border-white/10"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">QQ音乐登录</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white/60" />
            </button>
          </div>

          {/* 说明 */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              由于QQ音乐API限制，需要手动获取Cookie进行登录
            </p>
          </div>

          {/* 步骤 */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">打开QQ音乐官网并登录</h3>
                <button
                  onClick={handleOpenQQMusic}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  打开 y.qq.com
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">获取Cookie</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2 text-white/80 text-sm">
                  <p>1. 按 <kbd className="px-2 py-1 bg-white/10 rounded">F12</kbd> 打开开发者工具</p>
                  <p>2. 切换到 <strong>Console</strong> 标签</p>
                  <p>3. 输入以下代码并回车：</p>
                  <div className="bg-black/50 p-2 rounded font-mono text-green-400">
                    document.cookie
                  </div>
                  <p>4. 复制输出的内容（通常很长）</p>
                </div>
                <button
                  onClick={copyInstructions}
                  className="mt-2 flex items-center gap-2 px-3 py-1 text-white/60 hover:text-white text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制说明' : '复制操作说明'}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-2">粘贴Cookie</h3>
                <textarea
                  value={cookie}
                  onChange={(e) => {
                    setCookie(e.target.value)
                    setError('')
                  }}
                  placeholder="粘贴从浏览器复制的Cookie..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-green-500 resize-none"
                />
                {error && (
                  <p className="mt-2 text-red-400 text-sm">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* 登录按钮 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
            >
              登录
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
