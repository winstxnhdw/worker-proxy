import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

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

const BatchProxyErrorSchema = z.object({
  error: z.literal('Failed to fetch from one or more endpoints!'),
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
      description: 'The string response from the endpoint.',
      content: {
        'application/json': { schema: BatchProxyResponseSchema },
      },
    },
    500: {
      description: 'The response when the proxy has failed to fetch from one or more endpoints.',
      content: {
        'application/json': { schema: BatchProxyErrorSchema },
      },
    },
  },
})

const fetch_request = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body: string | null,
  headers?: Record<string, string>,
): Promise<string | undefined> => {
  try {
    const request = await fetch(endpoint, {
      method: method,
      body: body,
      headers: headers ?? {},
    })

    return request.text()
  } catch {
    return undefined
  }
}

export const batch_proxy = new OpenAPIHono().openapi(route, async ({ req, json }) => {
  const { batch } = await req.json<z.infer<typeof BatchProxyBodySchema>>()

  const responses = await Promise.all(
    batch.map(({ method, endpoint, body, headers }) =>
      fetch_request(method, endpoint, body ? JSON.stringify(body) : null, headers),
    ),
  )

  return !responses.some((response) => response === undefined)
    ? json({ responses: responses as string[] }, 200)
    : json({ error: 'Failed to fetch from one or more endpoints!' } as const, 500)
})
