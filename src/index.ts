import { json } from '@/middlewares'
import { default_proxy } from '@/routes/any/default'
import { default_proxy_get } from '@/routes/get/default'
import { redirect_proxy } from '@/routes/get/redirect'
import { batch_proxy } from '@/routes/post/batch'
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

  return app.route('/', batch_proxy).route('/', default_proxy).route('/', redirect_proxy).route('/', default_proxy_get)
}

export default main()
