import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class OtpInvalidException extends HttpException {
  constructor(
    objectOrError: string | object | any = 'Mã xác thực không hợp lệ!',
    descriptionOrOptions: string | HttpExceptionOptions = 'OTP Invalid',
  ) {
    const { description, httpExceptionOptions } =
      HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    super(
      HttpException.createBody(
        objectOrError,
        description,
        HttpStatus.NOT_ACCEPTABLE,
      ),
      HttpStatus.NOT_ACCEPTABLE,
      httpExceptionOptions,
    );
  }
}
