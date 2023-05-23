import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { STATUS_CODES } from 'http';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter<QueryFailedError> {
  constructor(public reflector: Reflector) {}

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '';

    switch (exception.driverError?.code) {
      case 'ER_PARSE_ERROR': // Truy vấn thất bại do lỗi cú pháp SQL
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid SQL syntax';
        break;
      case 'ER_NO_REFERENCED_ROW': // Truy vấn thất bại do lỗi ràng buộc khóa ngoại
        status = HttpStatus.BAD_REQUEST;
        message =
          exception.driverError?.sqlMessage || 'Foreign key constraint failed';
        break;
      case 'ER_DUP_ENTRY': // Truy vấn thất bại do lỗi trùng lặp khóa chính
        status = HttpStatus.CONFLICT;
        message = exception.driverError?.sqlMessage || 'Duplicate entry';
        break;
    }

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status],
      message: message,
    });
  }
}
