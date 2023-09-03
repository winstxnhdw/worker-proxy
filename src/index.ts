import { default_proxy, resilient_proxy } from '@/proxies'
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi'

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

router.post('/', default_proxy)
router.post('/resilient', resilient_proxy)
router.all('*', () => new Response('Not found!', { status: 404 }))

export default {
  fetch: router.handle
}
