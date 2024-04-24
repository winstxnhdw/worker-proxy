import { fetch_request } from '@/utils'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const DefaultProxyQuerySchema = z.object({
  endpoint: z.string().openapi({ example: 'https://account.battleon.com/charpage/details?id=53251829' }),
  body: z.string().optional().openapi({ example: '{ "data": 0 }' }),
  headers: z.string().optional().openapi({ example: '{ "User-Agent": "Mozilla/5.0" }' }),
  method: z.union([z.literal('GET'), z.literal('POST'), z.literal('PUT'), z.literal('DELETE')]).default('GET'),
})

const DefaultProxyErrorSchema = z.object({
  error: z.literal('Failed to fetch the endpoint!'),
})

const route = createRoute({
  method: 'get',
  path: '/get/default',
  request: { query: DefaultProxyQuerySchema },
  responses: {
    200: {
      description: 'The string response from the endpoint.',
    },
    500: {
      content: {
        'application/json': { schema: DefaultProxyErrorSchema },
      },
      description: 'The response when the proxy is unable to fetch the endpoint.',
    },
  },
})

const parse_json = <T extends Record<string, string>>(json: string | undefined): T | undefined => {
  if (json === undefined) return undefined

  try {
    return JSON.parse(json)
  } catch {
    return undefined
  }
}

export const default_proxy_get = new OpenAPIHono().openapi(route, async (context) => {
  const endpoint = context.req.query('endpoint')

  if (!endpoint) {
    return context.json({ error: 'Missing endpoint parameter!' })
  }

  const method = context.req.query('method') as 'GET' | 'POST' | 'PUT' | 'DELETE'
  const body = context.req.query('body') ?? null
  const headers = parse_json(context.req.query('headers'))
  const response = await fetch_request(method, endpoint, body, headers)

  return response ? context.html(response) : context.json({ error: 'Failed to fetch the endpoint!' }, 500)
})
