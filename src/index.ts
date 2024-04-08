import { json } from '@/middlewares'
import { default_proxy_get } from '@/routes/get/default'
import { redirect_proxy_get } from '@/routes/get/redirect'
import { batch_proxy_post } from '@/routes/post/batch'
import { default_proxy_post } from '@/routes/post/default'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'

function main() {
  const openapi_documentation_route = '/openapi.json'
  const app = new OpenAPIHono().doc(openapi_documentation_route, {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'worker-proxy',
    },
  })

  app.get('/docs', swaggerUI({ url: openapi_documentation_route }))
  app.use(cors(), json())
  // app.use(cache_param({ cacheName: 'worker-proxy' }))

  return app
    .openapi(default_proxy_post.route, default_proxy_post.handler)
    .openapi(default_proxy_get.route, default_proxy_get.handler)
    .openapi(batch_proxy_post.route, batch_proxy_post.handler)
    .openapi(redirect_proxy_get.route, redirect_proxy_get.handler)
}

export default main()
