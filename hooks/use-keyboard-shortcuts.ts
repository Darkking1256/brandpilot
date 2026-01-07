import { useEffect } from "react"

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = !shortcut.ctrl || e.ctrlKey
        const metaMatch = !shortcut.meta || e.metaKey
        const shiftMatch = !shortcut.shift || e.shiftKey
        const altMatch = !shortcut.alt || e.altKey
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        // Check if either Ctrl (Windows/Linux) or Meta (Mac) is pressed
        const modifierMatch = shortcut.ctrl || shortcut.meta
          ? (shortcut.ctrl && e.ctrlKey) || (shortcut.meta && e.metaKey)
          : true

        if (modifierMatch && shiftMatch && altMatch && keyMatch) {
          // Don't trigger if typing in an input, textarea, or contenteditable
          const target = e.target as HTMLElement
          if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
          ) {
            return
          }

          e.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}

// Global keyboard shortcuts provider
export function useGlobalKeyboardShortcuts() {
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      meta: true,
      action: () => {
        // Open search - trigger search input focus
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: "Open search",
    },
    {
      key: "n",
      ctrl: true,
      meta: true,
      action: () => {
        // Create new post - trigger new post button
        const newPostButton = document.querySelector('button:has-text("New Post"), button:has-text("Create Post")') as HTMLButtonElement
        if (newPostButton) {
          newPostButton.click()
        }
      },
      description: "Create new post",
    },
    {
      key: "/",
      action: () => {
        // Focus search on "/" key
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput && document.activeElement !== searchInput) {
          searchInput.focus()
        }
      },
      description: "Focus search",
    },
    {
      key: "Escape",
      action: () => {
        // Close modals/dialogs
        const closeButtons = document.querySelectorAll('[role="dialog"] button[aria-label*="close" i], [role="dialog"] button:has-text("Cancel")')
        if (closeButtons.length > 0) {
          const lastButton = closeButtons[closeButtons.length - 1] as HTMLButtonElement
          lastButton.click()
        }
      },
      description: "Close dialog",
    },
  ])
}

