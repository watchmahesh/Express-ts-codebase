import * as dotenv from 'dotenv'

dotenv.config()

const config = {
  app: {
    name: process.env.APP_NAME,
    queryToken: process.env.QUERY_TOKEN,
    headerToken: process.env.HEADER_TOKEN,
    env: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:8000',
    host: process.env.APP_HOST || 'localhost',
    port: process.env.APP_PORT || 8000,
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    originRegex: process.env.ORIGIN_REGEX,
    allowedOrigins: process.env.ALLOWED_ORIGIN,
    morganLevel: process.env.MORGAN_LEVEL || 'dev'
  },
  upload: {
    maxSize: process.env.MAX_IMG_SIZE || '2'
  },
  mail: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,

    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,

    token_ttl: Number(process.env.MAIL_TOKEN_TTL),
    from: process.env.MAIL_FROM,

    debug: process.env.MAIL_DEBUG === 'true' || false,
    log: process.env.MAIL_LOG === 'true' || false,
    receiver: process.env.MAIL_RECEIVER
  },
  db: {
    mongo_uri: process.env.MONGO_URI,
    strictDB: Boolean(process.env.MONGO_STRICT_DB) || false
  },

  jwt: {
    secretAccess: process.env.JWT_ACCESS_SECRET,
    issuer: process.env.JWT_ISSUER,
    token_access_ttl: process.env.JWT_ACCESS_EXPIRY || '1d'
  },
}
export default config
