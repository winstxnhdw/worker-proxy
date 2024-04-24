import { fetch_request, stringify_json } from '@/utils'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const DefaultProxyBodySchema = z.object({
  endpoint: z.string().openapi({ example: 'https://account.battleon.com/charpage/details?id=53251829' }),
  body: z
    .record(z.unknown())
    .optional()
    .openapi({ example: { data: 0 } }),
  headers: z
    .record(z.string())
    .optional()
    .openapi({
      example: { 'User-Agent': 'Mozilla/5.0' },
    }),
})

const DefaultProxyQuerySchema = z.object({
  method: z.union([z.literal('GET'), z.literal('POST'), z.literal('PUT'), z.literal('DELETE')]).default('GET'),
})

const DefaultProxyErrorSchema = z.object({
  error: z.literal('Failed to fetch the endpoint!'),
})

const route = createRoute({
  method: 'post',
  path: '/post/default',
  request: {
    query: DefaultProxyQuerySchema,
    body: {
      content: {
        'application/json': { schema: DefaultProxyBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'The string response from the endpoint.',
    },
    500: {
      content: {
        'application/json': { schema: DefaultProxyErrorSchema },
      },
      description: 'The response when the proxy has failed to fetch the endpoint.',
    },
  },
})

export const default_proxy = new OpenAPIHono().openapi(route, async (context) => {
  const method = context.req.query('method') as 'GET' | 'POST' | 'PUT' | 'DELETE'
  const { endpoint, body, headers } = await context.req.json<z.infer<typeof DefaultProxyBodySchema>>()
  const response = await fetch_request(method, endpoint, stringify_json(body), headers)

  return response ? context.html(response) : context.json({ error: 'Failed to fetch the endpoint!' } as const, 500)
})
