import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  expire: env.JWT_EXPIRE,
  refreshExpire: env.JWT_REFRESH_EXPIRE,
};
