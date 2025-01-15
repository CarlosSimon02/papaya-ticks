import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Dummy ratelimiter for development
const dummyRatelimiter = {
  limit: async () => ({ success: true })
};

// Create a new ratelimiter that allows 10 requests per 10 seconds
const createRatelimiter = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis credentials not found, using dummy rate limiter');
    return dummyRatelimiter;
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  });
};

export const ratelimit = createRatelimiter(); 