import { useEffect, useRef } from "react"
import { debounce } from "lodash"

interface UseAutosaveOptions {
  data: any
  onSave: (data: any) => Promise<void>
  interval?: number
  enabled?: boolean
}

export function useAutosave({ data, onSave, interval = 3000, enabled = true }: UseAutosaveOptions) {
  const lastSavedRef = useRef<string>("")
  const isSavingRef = useRef(false)

  const debouncedSave = useRef(
    debounce(async (dataToSave: any) => {
      if (isSavingRef.current) return
      const dataString = JSON.stringify(dataToSave)
      if (dataString === lastSavedRef.current) return

      isSavingRef.current = true
      try {
        await onSave(dataToSave)
        lastSavedRef.current = dataString
      } catch (error) {
        console.error("Autosave failed:", error)
      } finally {
        isSavingRef.current = false
      }
    }, interval)
  ).current

  useEffect(() => {
    if (!enabled) return
    if (!data) return

    debouncedSave(data)

    return () => {
      debouncedSave.cancel()
    }
  }, [data, enabled, debouncedSave])

  return {
    isSaving: isSavingRef.current,
  }
}

