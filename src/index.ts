import { default_proxy_get } from '@/routes/get/default'
import { batch_proxy_post } from '@/routes/post/batch'
import { default_proxy_post } from '@/routes/post/default'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'

function main() {
  const openapi_documentation_route = '/doc'
  const app = new OpenAPIHono().doc(openapi_documentation_route, {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'worker-proxy',
    },
  })

  app.get('/docs', swaggerUI({ url: openapi_documentation_route }))
  app.use('*', cors())

  app
    .openapi(default_proxy_post.route, default_proxy_post.handler)
    .openapi(default_proxy_get.route, default_proxy_get.handler)
    .openapi(batch_proxy_post.route, batch_proxy_post.handler)

  return app
}

export default main()
