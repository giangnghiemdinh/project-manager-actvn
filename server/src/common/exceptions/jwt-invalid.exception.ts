import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class JwtInvalidException extends HttpException {
  constructor(
    objectOrError: string | object | any = 'Chuỗi định danh không hợp lệ!',
    descriptionOrOptions: string | HttpExceptionOptions = 'JWT Invalid',
  ) {
    const { description, httpExceptionOptions } =
      HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    super(
      HttpException.createBody(
        objectOrError,
        description,
        HttpStatus.UNAUTHORIZED,
      ),
      HttpStatus.UNAUTHORIZED,
      httpExceptionOptions,
    );
  }
}
