import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useApi(url) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(() => {
    if (!url) return
    setLoading(true)
    setError(null)
    api.get(url)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.mensaje || 'Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [url])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch, setData }
}
