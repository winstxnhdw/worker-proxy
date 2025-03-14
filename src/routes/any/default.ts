import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const DefaultProxyQuerySchema = z.object({
  endpoint: z.string().openapi({ example: 'https://account.battleon.com/charpage/details?id=53251829' }),
})

const DefaultProxyBodySchema = z
  .record(z.unknown())
  .optional()
  .openapi({ example: { data: 0 } })

const DefaultProxyMultiPartSchema = z.object({
  file: z
    .custom<File>((v) => v instanceof File)
    .openapi({
      type: 'string',
      format: 'binary',
    }),
})

const DefaultProxyErrorSchema = z.object({
  error: z.literal('The `endpoint` query parameter is missing!'),
})

const create_proxies = (methods: ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']) => {
  const proxy = new OpenAPIHono()

  const routes = methods.map((method) =>
    createRoute({
      method: method,
      path: '/any/default',
      request: {
        query: DefaultProxyQuerySchema,
        body: {
          content: {
            'text/plain': { schema: z.string().openapi({ example: '' }) },
            'application/json': { schema: DefaultProxyBodySchema },
            'multipart/form-data': { schema: DefaultProxyMultiPartSchema },
          },
        },
      },
      responses: {
        200: {
          description: 'The response from the endpoint.',
        },
        400: {
          description: 'The response when the query endpoint is missing.',
          content: {
            'application/json': { schema: DefaultProxyErrorSchema },
          },
        },
      },
    }),
  )

  for (const route of routes) {
    proxy.openapi(route, async (context) => {
      const request = context.req.raw
      const endpoint = context.req.query('endpoint')

      return !endpoint
        ? context.json({ error: 'The `endpoint` query parameter is missing!' }, 400)
        : fetch(endpoint, {
            method: request.method,
            headers: request.headers,
            body: await context.req.text(),
            redirect: request.redirect,
            fetcher: request.fetcher,
            integrity: request.integrity,
            signal: request.signal,
          })
    })
  }

  return proxy
}

export const default_proxy = create_proxies(['get', 'post', 'put', 'delete', 'patch', 'options', 'head'])
