import { useEffect, useRef } from 'react'


    if (!enabled) return

    }
    return () => {

    }

    i

      const oscill

      gainNode.connect(ctx.destination)
      l

        case 's

        case 'warning':
          duration = 0.2

         
        case 'info':
          duration = 0.1
      }


      gainNode.gain.exponentialRampToVa

    } catch (error) {
    }

}






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
