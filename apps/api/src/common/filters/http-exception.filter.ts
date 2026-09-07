import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // If context is not HTTP (e.g. GraphQL error), let GraphQL layer handle it
    if (!response || typeof response.status !== 'function') {
      return exception;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).message || (exceptionResponse as any).error || 'Internal Server Error'
        : exception instanceof Error
          ? exception.message
          : 'Internal Server Error';

    const validationErrors =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).validationErrors
        : undefined;

    const errorPayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      message,
      ...(validationErrors ? { validationErrors } : {}),
    };

    if (status >= 500) {
      this.logger.error(`[${request?.method}] ${request?.url} - Error: ${message}`, exception instanceof Error ? exception.stack : '');
    } else {
      this.logger.warn(`[${request?.method}] ${request?.url} - Status ${status} - ${JSON.stringify(message)}`);
    }

    response.status(status).json(errorPayload);
  }
}
