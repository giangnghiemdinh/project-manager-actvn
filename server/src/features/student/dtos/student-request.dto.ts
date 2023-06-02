import { Gender } from '../../../common/constants';
import {
  DateProperty,
  EnumProperty,
  NumberProperty,
  StringProperty,
} from '../../../common/decorators';

export class StudentRequestDto {
  @StringProperty('Họ và tên', { required: true })
  readonly fullName: string;

  @StringProperty('Mã sinh viên', {
    required: true,
    maxLength: 8,
    toUpperCase: true,
  })
  readonly code: string;

  @StringProperty('Số điện thoại')
  readonly phone?: string;

  @StringProperty('Email', { email: true })
  readonly email?: string;

  @EnumProperty('Giới tính', Gender)
  readonly gender?: Gender;

  @DateProperty('Ngày sinh')
  readonly birthday?: Date;

  @NumberProperty('Khoa', { int: true, min: 1 })
  readonly departmentId: number;
}
