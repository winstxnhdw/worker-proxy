import type { MiddlewareHandler } from 'hono'
import { cache } from 'hono/cache'

export const cache_param = (options: Parameters<typeof cache>[0]): MiddlewareHandler => {
  const cache_middleware = cache(options)

  return async (context, next) => {
    if (context.req.query('cache') !== '') return next()
    await cache_middleware(context, next)
  }
}
