import { StringProperty } from '../../../common/decorators';

export class DepartmentRequestDto {
  @StringProperty('Tên khoa', { required: true, maxLength: 100 })
  readonly name: string;

  @StringProperty('Tên rút gọn', { required: true, maxLength: 10 })
  readonly shortName: string;

  @StringProperty('Mô tả')
  readonly description?: string;
}
