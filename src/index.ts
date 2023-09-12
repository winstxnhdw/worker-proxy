import { atomic_proxy, default_proxy } from '@/proxies'
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi'
import { createCors } from 'itty-router'

async function main(request: Request) {
  const router = OpenAPIRouter({
    docs_url: '/docs',
    schema: {
      info: {
        title: 'worker-proxy',
        description: 'A proxy for making requests to endpoint(s).',
        version: 'v1.0.0'
      }
    }
  })

  const { preflight, corsify } = createCors({
    methods: ['POST'],
    origins: ['*']
  })

  router.all('*', preflight)
  router.post('/', default_proxy)
  router.post('/atomic', atomic_proxy)
  router.all('*', () => new Response(undefined, { status: 404 }))

  return router.handle(request).catch(console.error).then(corsify)
}

export default {
  fetch: main
}
