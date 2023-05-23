import { TwoFactoryMethod } from '../../../common/constants';
import { EnumProperty } from '../../../common/decorators';

export class UserChange2faRequestDto {
  @EnumProperty('Hình thức xác thực', TwoFactoryMethod, { required: true })
  readonly twoFactory: TwoFactoryMethod;
}
