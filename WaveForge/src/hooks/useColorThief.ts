import { useState, useEffect } from 'react'

interface ColorPalette {
  dominantColor: string | null
  palette: string[]
}

export function useColorThief(imageUrl: string): ColorPalette {
  const [dominantColor, setDominantColor] = useState<string | null>(null)
  const [palette, setPalette] = useState<string[]>([])

  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 缩小图片以提高性能
      canvas.width = 50
      canvas.height = 50
      ctx.drawImage(img, 0, 0, 50, 50)

      const imageData = ctx.getImageData(0, 0, 50, 50).data
      
      // 简单的颜色提取算法
      let r = 0, g = 0, b = 0
      const pixelCount = imageData.length / 4

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i]
        g += imageData[i + 1]
        b += imageData[i + 2]
      }

      r = Math.floor(r / pixelCount)
      g = Math.floor(g / pixelCount)
      b = Math.floor(b / pixelCount)

      // 调暗颜色以适应背景
      const darkenFactor = 0.5
      r = Math.floor(r * darkenFactor)
      g = Math.floor(g * darkenFactor)
      b = Math.floor(b * darkenFactor)

      const color = `rgb(${r}, ${g}, ${b})`
      setDominantColor(color)
      setPalette([color])
    }

    img.onerror = () => {
      setDominantColor(null)
      setPalette([])
    }
  }, [imageUrl])

  return { dominantColor, palette }
}
