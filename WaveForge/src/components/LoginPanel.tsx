import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Music, Loader2 } from 'lucide-react'

interface LoginPanelProps {
  platform: 'netease' | 'qq'
  onClose: () => void
  onLoginSuccess: (cookie: string) => void
}

export default function LoginPanel({ platform, onClose, onLoginSuccess }: LoginPanelProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'pending' | 'scanned' | 'success' | 'expired'>('pending')
  const [pollTimer, setPollTimer] = useState<number | null>(null)

  const platformName = platform === 'netease' ? '网易云音乐' : 'QQ音乐'
  const platformColor = platform === 'netease' ? 'bg-red-600' : 'bg-green-600'

  // 获取二维码
  useEffect(() => {
    if (platform === 'netease') {
      fetchQRCode()
    }
    return () => {
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [])

  const fetchQRCode = async () => {
    setLoading(true)
    setStatus('pending')
    try {
      // 1. 获取二维码key
      const keyRes = await fetch('http://localhost:3001/api/netease/login/qr/key')
      const keyData = await keyRes.json()
      console.log('获取到key:', keyData)
      
      if (!keyData.data?.unikey) {
        throw new Error('获取key失败')
      }
      
      const key = keyData.data.unikey
      
      // 2. 创建二维码
      const qrRes = await fetch(`http://localhost:3001/api/netease/login/qr/create?key=${key}`)
      const qrData = await qrRes.json()
      console.log('获取到二维码:', qrData)
      
      if (qrData.data?.qrimg) {
        setQrCode(qrData.data.qrimg)
        startPolling(key)
        setLoading(false)
      } else {
        throw new Error('二维码数据格式错误')
      }
    } catch (error) {
      console.error('获取二维码失败:', error)
      setLoading(false)
      setStatus('expired')
    }
  }

  const startPolling = (key: string) => {
    const timer = setInterval(async () => {
      try {
        const endpoint = platform === 'netease'
          ? `/api/netease/login/qr/check?key=${key}`
          : `/api/qq/login/qr/check?key=${key}`
        
        const res = await fetch(`http://localhost:3001${endpoint}`)
        const data = await res.json()
        
        if (platform === 'netease') {
          // 800: 二维码过期
          // 801: 等待扫码
          // 802: 待确认
          // 803: 授权登录成功
          if (data.code === 800) {
            setStatus('expired')
            clearInterval(timer)
          } else if (data.code === 802) {
            setStatus('scanned')
          } else if (data.code === 803) {
            setStatus('success')
            clearInterval(timer)
            onLoginSuccess(data.cookie)
          }
        } else {
          // QQ音乐的状态码
          if (data.code === 0) {
            setStatus('success')
            clearInterval(timer)
            onLoginSuccess(data.cookie)
          }
        }
      } catch (error) {
        console.error('轮询登录状态失败:', error)
      }
    }, 2000) // 每2秒轮询一次

    setPollTimer(timer as unknown as number)
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '请使用手机APP扫描二维码'
      case 'scanned':
        return '扫描成功，请在手机上确认登录'
      case 'success':
        return '登录成功！'
      case 'expired':
        return '二维码已过期，请刷新'
      default:
        return ''
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
          className="bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/10"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`${platformColor} p-2 rounded-lg`}>
                <Music className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{platformName}登录</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white/60" />
            </button>
          </div>

          {/* 二维码区域 */}
          <div className="flex flex-col items-center gap-6">
            {loading ? (
              <div className="w-64 h-64 bg-white/5 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white/40 animate-spin" />
              </div>
            ) : status === 'expired' ? (
              <div className="w-64 h-64 bg-white/5 rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="text-white/60 text-center">二维码已过期</div>
                <button
                  onClick={fetchQRCode}
                  className="px-6 py-2 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
                >
                  刷新二维码
                </button>
              </div>
            ) : status === 'success' ? (
              <div className="w-64 h-64 bg-green-600/20 rounded-2xl flex flex-col items-center justify-center gap-4">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div className="text-white text-center">登录成功！</div>
              </div>
            ) : (
              <div className="w-64 h-64 bg-white p-4 rounded-2xl">
                <img src={qrCode} alt="登录二维码" className="w-full h-full" />
              </div>
            )}

            {/* 状态提示 */}
            <div className="text-center">
              <p className="text-white/80 mb-2">{getStatusText()}</p>
              {status === 'pending' && (
                <p className="text-white/40 text-sm">
                  打开{platformName}手机APP，扫描二维码登录
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
