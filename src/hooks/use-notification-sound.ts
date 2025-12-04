import { useEffect, useRef } from 'react'

export function useNotificationSound(enabled: boolean = true) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!enabled) return

    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext()
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [enabled])

  const playNotificationSound = (type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    if (!enabled || !audioContextRef.current) return

    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      let frequency = 600
      let duration = 0.15

      switch (type) {
        case 'success':
          frequency = 880
          duration = 0.2
          break
        case 'warning':
          frequency = 660
          duration = 0.2
          break
        case 'error':
          frequency = 440
          duration = 0.25
          break
        case 'info':
          frequency = 800
          duration = 0.1
          break
      }

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  return { playNotificationSound }
}
