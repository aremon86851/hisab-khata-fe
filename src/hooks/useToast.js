import { useState, useRef, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: 'info', visible: false })
  const timer = useRef(null)

  const show = useCallback((msg, type = 'info') => {
    clearTimeout(timer.current)
    setToast({ msg, type, visible: true })
    timer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }, [])

  return { toast, show }
}
