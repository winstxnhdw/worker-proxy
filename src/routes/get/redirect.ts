import { createRoute, z } from '@hono/zod-openapi'
import type { Handler } from 'hono'

const RedirectProxyQuerySchema = z.object({
  endpoint: z.string().openapi({ example: 'instagram://' }),
})

const RedirectProxyErrorSchema = z.object({
  error: z.literal('Failed to redirect to the endpoint!'),
})

const route = createRoute({
  method: 'get',
  path: '/get/redirect',
  request: { query: RedirectProxyQuerySchema },
  responses: {
    301: {
      description: 'Redirects to the endpoint.',
    },
    500: {
      content: {
        'application/json': { schema: RedirectProxyErrorSchema },
      },
      description: 'Failed to redirect to the the endpoint.',
    },
  },
})

const handler: Handler = async (context) => {
  const endpoint = context.req.query('endpoint')
  return endpoint
    ? context.redirect(endpoint, 301)
    : context.json({ error: 'Failed to redirect to the endpoint!' }, 500)
}

export const redirect_proxy_get = {
  route,
  handler,
}
