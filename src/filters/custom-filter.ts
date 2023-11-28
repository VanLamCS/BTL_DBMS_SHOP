import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

@Catch(
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Error,
)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(
    exception: any,
    /* | HttpException
      | BadRequestException
      | UnauthorizedException
      | ForbiddenException
      | NotFoundException, */
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json({
      status: 'error',
      statusCode: status,
      message: exception.message || 'Internal server error',
      path: request.url,
    });
  }
}
