import { DateProperty, StringProperty } from '../../../common/decorators';

export class SemesterRequestDto {
  @StringProperty('Tên học kỳ', { required: true, maxLength: 50 })
  readonly name: string;

  @DateProperty('Ngày bắt đầu', { required: true })
  readonly start: Date;

  @DateProperty('Ngày kết thúc', { required: true })
  readonly end: Date;
}
