import { ProxyRequest } from '@/types'

export const parse_request = async (request: Request): Promise<ProxyRequest | undefined> => {
  try {
    return request.json()
  } catch {
    return undefined
  }
}
