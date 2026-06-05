import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 1005;

    if (exception instanceof Error) {
      message = exception.message;
      
      // 处理常见异常
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        code = 1001;
      }
    }

    const apiResponse: ApiResponse<any> = {
      code,
      message,
      timestamp: Date.now(),
    };

    response.status(status).json(apiResponse);
  }
}
