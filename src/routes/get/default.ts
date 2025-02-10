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
    400: {
      description: 'The response when the query endpoint is missing.',
      content: {
        'application/json': { schema: DefaultProxyErrorSchema },
      },
    },
  },
})

const parse_json = <T extends Record<string, string>>(json: string | undefined): T | Record<never, never> => {
  if (json === undefined) return {}

  try {
    return JSON.parse(json)
  } catch {
    return {}
  }
}

export const default_proxy_get = new OpenAPIHono().openapi(route, async (context) => {
  const endpoint = context.req.query('endpoint')
  const method = context.req.query('method') as 'GET' | 'POST' | 'PUT' | 'DELETE'
  const body = context.req.query('body') ?? null
  const headers = parse_json(context.req.query('headers'))

  return !endpoint
    ? context.json({ error: 'The `endpoint` query parameter is missing!' })
    : fetch(endpoint, {
        method: method,
        body: body,
        headers: headers,
      })
})
