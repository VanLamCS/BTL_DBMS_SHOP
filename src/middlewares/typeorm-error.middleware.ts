// additional-exception.middleware.ts
import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TypeORMError } from 'typeorm';

@Injectable()
export class AdditionalExceptionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // If you want to catch synchronous errors, you can use a try-catch block
    try {
      // Your middleware logic here
      next();
    } catch (error) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;

      if (error instanceof TypeORMError) {
        status = HttpStatus.CONFLICT; // or your preferred status code
      }

      res.status(status).json({
        status: 'error',
        statusCode: status,
        message: error.message || 'Internal server error',
        path: req.url,
      });
    }
  }
}
