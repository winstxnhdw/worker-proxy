import { createRoute, z } from '@hono/zod-openapi'
import type { Handler } from 'hono'

const RedirectProxyQuerySchema = z.object({
  endpoint: z.string().openapi({ example: 'instagram://' }),
})

const route = createRoute({
  method: 'get',
  path: '/get/redirect',
  request: { query: RedirectProxyQuerySchema },
  responses: {
    200: {
      description: 'Redirects to the endpoint.',
    },
  },
})

const handler: Handler = async (context) => {
  const endpoint = context.req.query('endpoint')
  return endpoint ? context.redirect(endpoint) : context.json({ error: 'Failed to redirect to the endpoint!' })
}

export const redirect_proxy_get = {
  route,
  handler,
}
