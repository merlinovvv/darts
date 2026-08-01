import { useEffect } from 'react'

/** Включает тёмные hub-токены на body на время жизни экрана. */
export function useHubTheme() {
  useEffect(() => {
    document.body.classList.add('hub')

    return () => {
      document.body.classList.remove('hub')
    }
  }, [])
}
