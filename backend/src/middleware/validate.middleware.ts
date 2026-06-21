import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validateRequest = (schema: ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
