import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class JwtExpiredException extends HttpException {
  constructor(
    objectOrError: string | object | any = 'Chuỗi định danh đã hết hạn!',
    descriptionOrOptions: string | HttpExceptionOptions = 'JWT Expired',
  ) {
    const { description, httpExceptionOptions } =
      HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    super(
      HttpException.createBody(objectOrError, description, 902),
      902,
      httpExceptionOptions,
    );
  }
}
