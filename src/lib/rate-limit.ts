import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export { ratelimit } 