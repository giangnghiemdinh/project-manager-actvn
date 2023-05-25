import {
  DateProperty,
  EnumProperty,
  StringProperty,
} from '../../../common/decorators';
import { Gender, Role } from '../../../common/constants';

export class UserRequestDto {
  @StringProperty('Họ và tên', {
    required: true,
  })
  readonly fullName: string;

  @StringProperty('Email', {
    required: true,
    email: true,
  })
  readonly email: string;

  @StringProperty('Số điện thoại')
  readonly phone?: string;

  @StringProperty('Ảnh đại diện')
  avatar?: string;

  @StringProperty('Địa chỉ')
  readonly address?: string;

  @EnumProperty('Giới tính', Gender, { number: true })
  readonly gender?: Gender;

  @DateProperty('Ngày sinh')
  readonly birthday?: Date;

  @EnumProperty('Vai trò', Role, { default: Role.LECTURER })
  role: Role;

  @StringProperty('Đơn vị')
  readonly workPlace?: string;

  password?: string;

  avatarFile?: any;
}
