import { useEffect, useRef, useState } from 'react'

interface AudioAnalyzerData {
  bass: number      // 低音强度 0-1
  mid: number       // 中音强度 0-1
  high: number      // 高音强度 0-1
  overall: number   // 整体强度 0-1
}

export function useAudioAnalyzer(audioElement: HTMLAudioElement | null, enabled: boolean = true) {
  const [analyzerData, setAnalyzerData] = useState<AudioAnalyzerData>({
    bass: 0,
    mid: 0,
    high: 0,
    overall: 0
  })
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    console.log('useAudioAnalyzer: enabled =', enabled, 'audioElement =', !!audioElement)
    if (!audioElement) {
      // 没有音频元素时才完全清理
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
      audioContextRef.current = null
      analyserRef.current = null
      dataArrayRef.current = null
      sourceRef.current = null
      return
    }
    
    if (!enabled) {
      // 只停止分析，不关闭音频上下文（避免中断播放）
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      // 重置分析数据
      setAnalyzerData({
        bass: 0,
        mid: 0,
        high: 0,
        overall: 0
      })
      return
    }

    try {
      // 创建音频上下文
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current

      // 创建分析器节点
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser()
        analyserRef.current.fftSize = 512  // 增加 FFT 大小以获得更精确的频率分析
        analyserRef.current.smoothingTimeConstant = 0.85  // 提高平滑度
      }

      const analyser = analyserRef.current
      const bufferLength = analyser.frequencyBinCount
      
      if (!dataArrayRef.current) {
        dataArrayRef.current = new Uint8Array(bufferLength)
      }

      // 连接音频源
      if (!sourceRef.current) {
        try {
          sourceRef.current = audioContext.createMediaElementSource(audioElement)
          sourceRef.current.connect(analyser)
          analyser.connect(audioContext.destination)
        } catch (e) {
          console.warn('Audio source already connected:', e)
        }
      }

      // 分析音频数据
      const analyze = () => {
        if (!analyser || !dataArrayRef.current) return

        analyser.getByteFrequencyData(dataArrayRef.current)
        
        const dataArray = dataArrayRef.current
        const length = dataArray.length

        // 分频段计算（优化频段分布）
        const bassEnd = Math.floor(length * 0.15)       // 0-15% 低音（增强低音感知）
        const midEnd = Math.floor(length * 0.5)         // 15-50% 中音
        // 50-100% 高音

        let bassSum = 0
        let midSum = 0
        let highSum = 0

        for (let i = 0; i < length; i++) {
          const value = dataArray[i] / 255
          if (i < bassEnd) {
            bassSum += value
          } else if (i < midEnd) {
            midSum += value
          } else {
            highSum += value
          }
        }

        const bassAvg = bassSum / bassEnd
        const midAvg = midSum / (midEnd - bassEnd)
        const highAvg = highSum / (length - midEnd)
        const overallAvg = (bassSum + midSum + highSum) / length

        setAnalyzerData({
          bass: Math.min(bassAvg * 1.8, 1),      // 增强低音反馈
          mid: Math.min(midAvg * 1.2, 1),        // 适度增强中音
          high: Math.min(highAvg * 1.0, 1),      // 高音保持原样
          overall: Math.min(overallAvg * 1.3, 1) // 整体适度增强
        })

        animationFrameRef.current = requestAnimationFrame(analyze)
      }

      // 恢复音频上下文（如果被暂停）
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      analyze()

    } catch (error) {
      console.error('Audio analyzer error:', error)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioElement, enabled])

  return analyzerData
}
