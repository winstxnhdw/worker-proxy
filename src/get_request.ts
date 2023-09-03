import { Endpoint } from '@/types'

export const get_request = async (endpoint_request: Endpoint): Promise<string> => {
  const request = await fetch(endpoint_request.endpoint, {
    headers: endpoint_request.headers ?? {}
  })

  return request.text()
}
