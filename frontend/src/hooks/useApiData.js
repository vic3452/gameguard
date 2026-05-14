import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export const useApiData = (url, errorMsg = 'Failed to load data') => {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    api.get(url)
      .then(r => setData(r.data))
      .catch(() => toast.error(errorMsg))
      .finally(() => setLoading(false))
  }, [url, errorMsg])

  useEffect(() => { reload() }, [reload])

  return { data, loading, reload, setData }
}
