import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '@prisma/client/runtime';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(AllExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();

    this.logger.error(
      `Exception occurred on request ${req.method} ${req.url} - ${
        (exception as Error).stack
      }`,
    );
    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';
    let errors = [];
    if (exception instanceof BadRequestException) {
      httpStatus = HttpStatus.BAD_REQUEST;
      message = 'Request Constraint Violation';
      const respObj = exception.getResponse() as object;
      const validationMsg = respObj['message'];
      if (Array.isArray(validationMsg)) {
        errors = [...validationMsg];
      } else {
        errors.push(validationMsg);
      }
    } else if (
      exception instanceof NotFoundException ||
      exception instanceof NotFoundError
    ) {
      httpStatus = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      if (exception.code == 'P2025') {
        message = String(exception.meta.cause);
      } else if (exception.code == 'P2002') {
        message = exception.meta
          ? `Unique Constraint Failed on: ${exception.meta.target}`
          : exception.message;
      }
    } else if (exception instanceof UnauthorizedException) {
      message = exception.message;
      httpStatus = HttpStatus.UNAUTHORIZED;
    }
    const respBody = {
      success: false,
      message: message,
      data: null,
      errors: errors,
    };

    httpAdapter.reply(ctx.getResponse(), respBody, httpStatus);
  }
}
