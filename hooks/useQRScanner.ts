'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

export function useQRScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const instanceRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const runningRef = useRef(false)
  const elId = 'qr-reader-element'

  const stop = useCallback(async () => {
    if (!runningRef.current) {
      instanceRef.current = null
      setScanning(false)
      setCameraReady(false)
      return
    }
    try {
      await instanceRef.current?.stop()
    } catch {}
    runningRef.current = false
    instanceRef.current = null
    setScanning(false)
    setCameraReady(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setResult(null)
    setScanning(true)
    setCameraReady(false)

    const { Html5Qrcode } = await import('html5-qrcode')

    const el = document.getElementById(elId)
    if (!el) {
      setScanning(false)
      return
    }

    try {
      const instance = new Html5Qrcode(elId)
      instanceRef.current = instance

      const cameras = await Html5Qrcode.getCameras()
      if (!cameras.length) {
        setError('No camera found on this device.')
        setScanning(false)
        return
      }

      runningRef.current = true

      await instance.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          setResult(decodedText)
          runningRef.current = false
          setCameraReady(false)
          instance.stop().catch(() => {})
          setScanning(false)
        },
        () => {},
      )

      setCameraReady(true)
    } catch (err: unknown) {
      runningRef.current = false
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('NotAllowed')) {
        setError('Camera permission denied. Please allow camera access.')
      } else if (msg.includes('NotFound')) {
        setError('No camera found on this device.')
      } else {
        setError(msg || 'Failed to start camera.')
      }
      setScanning(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    stop()
  }, [stop])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return { elId, scanning, result, error, cameraReady, start, stop, reset }
}
