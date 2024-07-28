import { useContext } from 'react'

import { ApiContext } from '../context/ApiContext'

export function useApi() {
  const { api } = useContext(ApiContext)

  return api
}
