import { useState, useCallback } from 'react'

export function useCalculator() {
  const [display, setDisplay]   = useState('0')
  const [prevVal, setPrevVal]   = useState(null)
  const [op, setOp]             = useState(null)
  const [opLabel, setOpLabel]   = useState('')
  const [newNum, setNewNum]     = useState(true)

  const pressNum = useCallback((n) => {
    setDisplay(prev => {
      if (newNum) return n === '.' ? '0.' : n === '0' ? '0' : n
      if (n === '.' && prev.includes('.')) return prev
      return prev === '0' && n !== '.' ? n : prev + n
    })
    setNewNum(false)
  }, [newNum])

  const pressOp = useCallback((o) => {
    setDisplay(prev => {
      setPrevVal(parseFloat(prev))
      setOpLabel(parseFloat(prev).toLocaleString('en') + ' ' + o)
      return prev
    })
    setOp(o)
    setNewNum(true)
  }, [])

  const pressEquals = useCallback(() => {
    if (!op || prevVal === null) return
    const b = parseFloat(display)
    let r
    if (op === '+')  r = prevVal + b
    if (op === '−')  r = prevVal - b
    if (op === '×')  r = prevVal * b
    if (op === '÷')  r = b !== 0 ? prevVal / b : 0
    if (op === '%')  r = prevVal * b / 100
    const rounded = Math.round(r * 100) / 100
    setDisplay(String(rounded))
    setOp(null); setPrevVal(null); setNewNum(true); setOpLabel('')
  }, [op, prevVal, display])

  const pressAC = useCallback(() => {
    setDisplay('0'); setOp(null); setPrevVal(null); setNewNum(true); setOpLabel('')
  }, [])

  const pressBS = useCallback(() => {
    setDisplay(prev => prev.length <= 1 ? '0' : prev.slice(0, -1))
    setNewNum(false)
  }, [])

  return { display, opLabel, pressNum, pressOp, pressEquals, pressAC, pressBS }
}
