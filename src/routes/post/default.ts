import { fetch_request } from '@/fetch_request'
import { stringify_json } from '@/stringify_json'
import { createRoute, z } from '@hono/zod-openapi'
import type { Handler } from 'hono'

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

const route = createRoute({
  method: 'post',
  path: '/post/default',
  request: {
    query: DefaultProxyQuerySchema,
    body: {
      content: {
        'application/json': {
          schema: DefaultProxyBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'text/plain': {
          schema: z.string(),
        },
      },
      description: 'The string response from the endpoint.',
    },
  },
})

const handler: Handler = async (context) => {
  const method = context.req.query('method') as 'GET' | 'POST' | 'PUT' | 'DELETE'
  const { endpoint, body, headers } = await context.req.json<z.infer<typeof DefaultProxyBodySchema>>()
  const response = await fetch_request(method, endpoint, stringify_json(body), headers)

  return response ? context.text(response) : context.json({ error: 'Failed to fetch the endpoint.' })
}

export const default_proxy_post = {
  route,
  handler,
}
