import { get_request } from '@/get_request'
import { parse_request } from '@/parse_request'

async function main(request: Request): Promise<Response> {
  const proxy_request = await parse_request(request)

  if (proxy_request === undefined) {
    return new Response('Invalid request!', { status: 400 })
  }

  const responses = await Promise.all(proxy_request.endpoints.map(get_request)).catch(() => undefined)

  return responses
    ? new Response(JSON.stringify(responses), { status: 200 })
    : new Response('All or some requests has failed!', { status: 500 })
}

export default {
  fetch: main
}
