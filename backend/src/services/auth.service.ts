import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export const generateAccessToken = (userId: string, email: string): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.expire as any,
    algorithm: 'HS256',
  };
  return jwt.sign(
    { id: userId, email },
    jwtConfig.secret as Secret,
    options
  );
};

export const generateRefreshToken = (userId: string, email: string): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.refreshExpire as any,
    algorithm: 'HS256',
  };
  return jwt.sign(
    { id: userId, email },
    jwtConfig.refreshSecret as Secret,
    options
  );
};

export const verifyRefreshToken = (token: string): { id: string; email: string } => {
  const secret = (jwtConfig.refreshSecret || jwtConfig.secret) as Secret;
  return jwt.verify(token, secret) as unknown as { id: string; email: string };
};
