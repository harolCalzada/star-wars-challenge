export const environment = {
  service: {
    name: process.env.SERVICE_NAME || 'star-wars-challenge',
    stage: process.env.STAGE || 'dev'
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1'
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '1800', 10) // 30 minutes in seconds
  },
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || ''
  }
};
