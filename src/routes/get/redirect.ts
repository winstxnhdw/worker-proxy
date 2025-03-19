import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

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
    400: {
      description: 'The response when the query endpoint is missing.',
      content: {
        'application/json': { schema: RedirectProxyErrorSchema },
      },
    },
  },
})

export const redirect_proxy = new OpenAPIHono().openapi(route, ({ req, redirect, json }) => {
  const endpoint = req.query('endpoint')
  return endpoint ? redirect(endpoint, 301) : json({ error: 'Failed to redirect to the endpoint!' }, 400)
})
