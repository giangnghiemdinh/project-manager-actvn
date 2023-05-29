import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const statusCode = res.statusCode;
      const statusMessage = res.statusMessage;
      if (
        [400, 401, 403, 404, 405, 406, 409, 415, 500, 502].includes(statusCode)
      ) {
        this.logger.error(`[${req.method}] ${req.url} - ${statusMessage}`);
      }
    });

    next();
  }
}
