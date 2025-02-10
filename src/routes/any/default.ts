import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

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

const route = createRoute({
  method: 'post',
  path: '/any/default/{endpoint}',
  request: {
    params: z.object({ endpoint: z.string() }),
    body: {
      content: {
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
})

export const default_proxy = new OpenAPIHono().openapi(route, (context) => {
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
