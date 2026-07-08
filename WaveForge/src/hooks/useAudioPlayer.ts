import { useRef, useEffect } from 'react'

interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  buffered: number
  ended: boolean
}

export function useAudioPlayer(onStateChange: (state: Partial<AudioPlayerState>) => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimerRef = useRef<number | null>(null)
  const onStateChangeRef = useRef(onStateChange)

  // 保持 onStateChange 引用最新
  useEffect(() => {
    onStateChangeRef.current = onStateChange
  }, [onStateChange])

  // 初始化 Web Audio API
  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.preload = 'auto'
    audio.volume = 0.7
    audioRef.current = audio

    console.log('Audio 元素已创建:', audio)

    // 绑定事件
    let lastTime = 0
    let jumpCount = 0
    const jumpTimes: number[] = [] // 记录跳跃发生的时间点
    
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime
      const timeDiff = currentTime - lastTime
      
      // 检测异常的时间跳跃（超过1秒的跳跃）
      if (lastTime > 0 && timeDiff > 1.5 && !audio.seeking) {
        jumpCount++
        jumpTimes.push(currentTime)
        
        console.error('🚨 检测到异常时间跳跃 #' + jumpCount + ':', {
          从: lastTime.toFixed(2),
          到: currentTime.toFixed(2),
          跳跃: timeDiff.toFixed(2) + '秒',
          总跳跃次数: jumpCount,
          跳跃时间点: jumpTimes.map(t => t.toFixed(1) + 's').join(', ')
        })
      }
      
      lastTime = currentTime
      
      // 检测异常的播放速度
      if (audio.playbackRate !== 1.0) {
        console.warn('⚠️ 播放速度异常:', audio.playbackRate, '正在修复...')
        audio.playbackRate = 1.0
      }
      
      onStateChangeRef.current({
        currentTime: audio.currentTime,
        duration: audio.duration || 0
      })
    }

    const handleLoadedMetadata = () => {
      console.log('音频元数据已加载, duration:', audio.duration)
      onStateChangeRef.current({
        duration: audio.duration || 0
      })
    }

    const handleEnded = () => {
      console.log('音频播放结束')
      onStateChangeRef.current({ isPlaying: false, ended: true })
    }

    const handleError = (e: Event) => {
      console.error('音频加载错误:', e, audio.error)
      onStateChangeRef.current({ isPlaying: false })
    }

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const buffered = audio.buffered.end(audio.buffered.length - 1)
        onStateChangeRef.current({ buffered })
      }
    }

    const handleCanPlay = () => {
      console.log('音频可以播放了')
    }

    const handleRateChange = () => {
      if (audio.playbackRate !== 1.0) {
        console.error('🚨 播放速度被改变:', audio.playbackRate)
        audio.playbackRate = 1.0
      }
    }

    const handleSeeking = () => {
      console.log('🔄 正在跳转到:', audio.currentTime.toFixed(2))
    }

    const handleSeeked = () => {
      console.log('✅ 跳转完成:', audio.currentTime.toFixed(2))
    }

    const handleStalled = () => {
      console.warn('⚠️ 音频加载停滞')
    }

    const handleWaiting = () => {
      console.warn('⚠️ 音频缓冲中...')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('progress', handleProgress)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ratechange', handleRateChange)
    audio.addEventListener('seeking', handleSeeking)
    audio.addEventListener('seeked', handleSeeked)
    audio.addEventListener('stalled', handleStalled)
    audio.addEventListener('waiting', handleWaiting)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('progress', handleProgress)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ratechange', handleRateChange)
      audio.removeEventListener('seeking', handleSeeking)
      audio.removeEventListener('seeked', handleSeeked)
      audio.removeEventListener('stalled', handleStalled)
      audio.removeEventListener('waiting', handleWaiting)
      
      audio.pause()
      audio.src = ''
    }
  }, []) // 空依赖数组，只在组件挂载时创建一次audio元素

  // 平滑音量淡入淡出
  const rampVolume = (targetVolume: number, durationMs: number) => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current)
    }

    const audio = audioRef.current
    if (!audio) return

    console.log(`音量渐变: 从 ${audio.volume.toFixed(2)} 到 ${targetVolume}, 时长: ${durationMs}ms`)

    // 直接使用 HTML5 Audio
    const startVolume = audio.volume
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out
      
      audio.volume = startVolume + (targetVolume - startVolume) * eased

      if (progress < 1) {
        fadeTimerRef.current = requestAnimationFrame(animate) as unknown as number
      } else {
        console.log(`音量渐变完成: ${audio.volume.toFixed(2)}`)
      }
    }

    animate()
  }

  // 加载并播放
  const loadAndPlay = async (url: string, startVolume = 0.7) => {
    const audio = audioRef.current
    if (!audio) {
      console.error('Audio 元素未初始化')
      return
    }

    try {
      console.log('开始加载音频:', url)

      // 不使用 Web Audio API，直接用 HTML5 Audio
      // initAudioContext()

      // 淡出旧音频
      if (audio.src && !audio.paused) {
        console.log('淡出旧音频')
        rampVolume(0, 200)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // 加载新音频
      audio.src = url
      audio.load()

      console.log('等待音频加载...')

      // 等待可以播放
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          console.log('音频已就绪，可以播放')
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          resolve(undefined)
        }
        const handleError = (e: Event) => {
          console.error('音频加载失败:', e, audio.error)
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          reject(e)
        }
        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('error', handleError)
      })

      // 从低音量开始
      audio.volume = 0.1
      console.log('开始播放，音量:', audio.volume)

      // 播放
      await audio.play()
      console.log('播放成功，开始淡入到音量:', startVolume)
      onStateChange({ isPlaying: true })

      // 淡入到目标音量
      rampVolume(startVolume, 460)

    } catch (error) {
      console.error('播放失败:', error)
      onStateChange({ isPlaying: false })
      throw error
    }
  }

  // 播放/暂停
  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio || !audio.src) return

    try {
      if (audio.paused) {
        console.log('开始播放')
        await audio.play()
        onStateChange({ isPlaying: true })
      } else {
        console.log('暂停播放')
        audio.pause()
        onStateChange({ isPlaying: false })
      }
    } catch (error) {
      console.error('播放/暂停失败:', error)
    }
  }

  // 跳转
  const seek = (time: number) => {
    const audio = audioRef.current
    if (!audio) return
    
    const targetTime = Math.max(0, Math.min(time, audio.duration || 0))
    console.log(`跳转到: ${targetTime.toFixed(2)}s (从 ${audio.currentTime.toFixed(2)}s)`)
    audio.currentTime = targetTime
  }

  // 设置音量
  const setVolume = (volume: number) => {
    const audio = audioRef.current
    if (!audio) return
    
    const clampedVolume = Math.max(0, Math.min(1, volume))
    audio.volume = clampedVolume
    console.log('设置音量:', clampedVolume)
    
    onStateChange({ volume: clampedVolume })
  }

  return {
    loadAndPlay,
    togglePlay,
    seek,
    setVolume,
    audioElement: audioRef.current,
  }
}
