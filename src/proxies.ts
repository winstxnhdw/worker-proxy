import { get_request } from '@/get_request'
import type { Endpoint, ProxyRequest } from '@/types'

const parse_request = async <T extends ProxyRequest | Endpoint>(request: Request): Promise<T | undefined> => {
  try {
    return request.json()
  } catch {
    return undefined
  }
}

export const default_proxy = async (request: Request): Promise<Response> => {
  const proxy_request = await parse_request<ProxyRequest>(request)

  if (proxy_request === undefined) {
    return new Response('Invalid request!', { status: 400 })
  }

  const responses = await Promise.all(proxy_request.endpoints.map(get_request)).catch(() => undefined)

  return responses
    ? new Response(JSON.stringify(responses), { status: 200 })
    : new Response('All or some requests has failed!', { status: 500 })
}

export const resilient_proxy = async (request: Request): Promise<Response> => {
  const proxy_request = await parse_request<ProxyRequest>(request)

  if (proxy_request === undefined) {
    return new Response('Invalid request!', { status: 400 })
  }

  const results = await Promise.allSettled(proxy_request.endpoints.map(get_request))
  const responses = results
    .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
    .map((result): string => result.value)

  return responses.length !== 0
    ? new Response(JSON.stringify(responses), { status: 200 })
    : new Response('All requests has failed!', { status: 500 })
}

export const atomic_proxy = async (request: Request): Promise<Response> => {
  const proxy_request = await parse_request<Endpoint>(request)

  if (proxy_request === undefined) {
    return new Response('Invalid request!', { status: 400 })
  }

  const response = await get_request(proxy_request).catch(() => undefined)

  return response
    ? new Response(JSON.stringify(response), { status: 200 })
    : new Response('Request has failed!', { status: 500 })
}
