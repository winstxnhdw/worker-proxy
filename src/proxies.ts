import { get_request } from '@/get_request'
import type { Endpoint, ProxyRequest } from '@/types'

const parse_request = async <T extends ProxyRequest | Endpoint>(request: Request): Promise<T | undefined> => {
  try {
    return request.json()
  } catch {
    return undefined
  }
}

const stringify_error = (error: string, message: string = ''): string => {
  return JSON.stringify({
    message: message,
    error: error
  })
}

export const default_proxy = async (request: Request): Promise<Response> => {
  const proxy_request = await parse_request<ProxyRequest>(request)

  if (proxy_request === undefined) {
    return new Response('Invalid request!', { status: 400 })
  }

  const responses = await Promise.all(proxy_request.endpoints.map(get_request)).catch(
    (reason: string) => [undefined, reason] as const
  )

  return responses[0]
    ? new Response(JSON.stringify(responses), { status: 200 })
    : new Response(stringify_error(responses[1], 'All or some requests has failed!'), { status: 500 })
}

export const atomic_proxy = async (request: Request): Promise<Response> => {
  const proxy_request = await parse_request<Endpoint>(request)

  if (proxy_request === undefined) {
    return new Response('Invalid request!', { status: 400 })
  }

  const response = await get_request(proxy_request).catch((reason: string) => [undefined, reason] as const)

  return response[0]
    ? new Response(JSON.stringify(response), { status: 200 })
    : new Response(stringify_error(response[1], 'All or some requests has failed!'), { status: 500 })
}
