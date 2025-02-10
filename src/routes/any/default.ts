import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const DefaultProxyParamsSchema = z.object({
  endpoint: z.string().openapi({ example: 'https://account.battleon.com/charpage/details?id=53251829' }),
})

const DefaultProxyBodySchema = z.object({
  body: z
    .record(z.unknown())
    .optional()
    .openapi({ example: { data: 0 } }),
})

const DefaultProxyMultiPartSchema = z.object({
  file: z
    .custom<File>((v) => v instanceof File)
    .openapi({
      type: 'string',
      format: 'binary',
    }),
})

const create_proxies = () => {
  const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const
  const proxy = new OpenAPIHono()

  const routes = methods.map((method) =>
    createRoute({
      method: method,
      path: '/any/default/{endpoint}',
      request: {
        params: DefaultProxyParamsSchema,
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
      },
    }),
  )

  for (const route of routes) {
    proxy.openapi(route, async (context) => {
      const request = context.req.raw

      return fetch(context.req.param('endpoint'), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: request.redirect,
        fetcher: request.fetcher,
        integrity: request.integrity,
        signal: request.signal,
      })
    })
  }

  return proxy
}

export const default_proxy = create_proxies()
