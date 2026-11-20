import { useCallback, useEffect, useState } from 'react'
import { listArticles } from './articles'
import { listCreatives } from './creatives'
import { getSiteSettings } from './siteSettings'

// Fetches the dashboard numbers. Runs only while Home is the open section, as when Home was a route.
export function useHomeData(enabled) {
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    setFailed(false)
    setData(null)
    const [a, c, s] = await Promise.allSettled([listArticles(), listCreatives(), getSiteSettings()])
    if (a.status === 'rejected' && c.status === 'rejected' && s.status === 'rejected') {
      setFailed(true)
      return
    }
    setData({
      articles: a.status === 'fulfilled' ? a.value : null,
      creatives: c.status === 'fulfilled' ? c.value : null,
      settings: s.status === 'fulfilled' ? s.value : null,
    })
  }, [])

  useEffect(() => {
    if (enabled) load()
  }, [enabled, load])

  return { data, failed, load }
}
