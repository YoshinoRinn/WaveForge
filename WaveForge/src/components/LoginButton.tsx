import { useState } from 'react'
import { User, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import LoginPanel from './LoginPanel'
import QQLoginPanel from './QQLoginPanel'

interface LoginButtonProps {
  platform: 'netease' | 'qq'
  isLoggedIn: boolean
  username?: string
  onLogin: (cookie: string) => void
  onLogout: () => void
}

export default function LoginButton({ platform, isLoggedIn, username, onLogin, onLogout }: LoginButtonProps) {
  const [showLoginPanel, setShowLoginPanel] = useState(false)
  
  const platformName = platform === 'netease' ? '网易云' : 'QQ音乐'
  const platformColor = platform === 'netease' 
    ? 'bg-red-600 hover:bg-red-700' 
    : 'bg-green-600 hover:bg-green-700'

  const handleLoginSuccess = (cookie: string) => {
    onLogin(cookie)
    setShowLoginPanel(false)
  }

  return (
    <>
      {isLoggedIn ? (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm">{username || platformName}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="登出"
          >
            <LogOut className="w-4 h-4 text-white/60" />
          </button>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLoginPanel(true)}
          className={`px-4 py-2 ${platformColor} text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2`}
        >
          <User className="w-4 h-4" />
          登录{platformName}
        </motion.button>
      )}

      {showLoginPanel && platform === 'netease' && (
        <LoginPanel
          platform={platform}
          onClose={() => setShowLoginPanel(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showLoginPanel && platform === 'qq' && (
        <QQLoginPanel
          onClose={() => setShowLoginPanel(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  )
}
