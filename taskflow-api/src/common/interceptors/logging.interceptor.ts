import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response, Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const statusCode = res.statusCode;
          this.logger.log(`${method} ${url} ${statusCode} [${ms}ms]`);
        },
        error: (err) => {
          const ms = Date.now() - start;
          const statusCode = res.statusCode;
          this.logger.warn(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `${method} ${url} ${statusCode} [${ms}ms] - ${err.message}`,
          );
        },
      }),
    );
  }
}
