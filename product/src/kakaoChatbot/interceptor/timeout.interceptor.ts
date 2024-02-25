import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor
  implements NestInterceptor
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    return next.handle().pipe(
      timeout(4000), // KakaoChatbot skill response timeout is 5 seconds.
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  };
};