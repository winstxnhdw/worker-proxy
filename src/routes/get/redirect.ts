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
    500: {
      description: 'The response when no redirectable endpoint is given.',
      content: {
        'application/json': { schema: RedirectProxyErrorSchema },
      },
    },
  },
})

export const redirect_proxy = new OpenAPIHono().openapi(route, (context) => {
  const endpoint = context.req.query('endpoint')

  return endpoint
    ? context.redirect(endpoint, 301)
    : context.json({ error: 'Failed to redirect to the endpoint!' }, 500)
})
