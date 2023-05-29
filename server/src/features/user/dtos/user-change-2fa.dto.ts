import { TwoFactoryMethod } from '../../../common/constants';
import { EnumProperty, NumberProperty } from '../../../common/decorators';

export class UserChange2faRequestDto {
  @NumberProperty('ID người dùng', { int: true, min: 1 })
  id: number;

  @EnumProperty('Hình thức xác thực', TwoFactoryMethod, { required: true })
  readonly twoFactory: TwoFactoryMethod;
}
