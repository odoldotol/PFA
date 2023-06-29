import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {

    private readonly logger = new Logger('HttpLogger');

    async use(req: Request, res: Response, next: NextFunction) {
        req.url
        const now = Date.now();
        const { method, originalUrl } = req;
        res.on('finish', () => {
            const responseTime = Date.now() - now;
            const { statusCode } = res;
            if (originalUrl === '/health' && method === 'GET' && statusCode === 200) return;
            this.logger.log(`${statusCode} | ${responseTime}ms | ${method} | ${originalUrl}`);
        });
        next();
    }
    
}