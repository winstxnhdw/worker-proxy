import { fetch_request } from '@/fetch_request'
import { stringify_json } from '@/stringify_json.js'
import { createRoute, z } from '@hono/zod-openapi'
import type { Handler } from 'hono'

const BatchProxyBodySchema = z.object({
  batch: z.array(
    z.object({
      endpoint: z.string().openapi({ example: 'https://account.battleon.com/charpage/details?id=53251829' }),
      method: z.union([z.literal('GET'), z.literal('POST'), z.literal('PUT'), z.literal('DELETE')]).default('GET'),
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
    }),
  ),
})

const BatchProxyResponseSchema = z.object({
  responses: z.array(z.string()),
})

const route = createRoute({
  method: 'post',
  path: '/post/batch',
  request: {
    body: {
      content: {
        'application/json': { schema: BatchProxyBodySchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: BatchProxyResponseSchema },
      },
      description: 'The string response from the endpoint.',
    },
  },
})

const handler: Handler = async (context) => {
  const { batch } = await context.req.json<z.infer<typeof BatchProxyBodySchema>>()

  const responses = await Promise.all(
    batch.map(({ method, endpoint, body, headers }) => fetch_request(method, endpoint, stringify_json(body), headers)),
  )

  return !responses.some((response) => response === undefined)
    ? context.json({ responses: responses })
    : context.json({ error: 'Failed to fetch from one or more endpoints.' })
}

export const batch_proxy_post = {
  route,
  handler,
}
