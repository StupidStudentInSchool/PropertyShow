import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../filters/all-exceptions.filter';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept<T>(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
        timestamp: Date.now(),
      })),
    );
  }
}
