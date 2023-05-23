import { UserStatus } from '../../../common/constants';
import { EnumProperty, NumberProperty } from '../../../common/decorators';

export class UserChangeStatusRequestDto {
  @NumberProperty('ID người dùng', {
    required: true,
    int: true,
    min: 1,
  })
  readonly id: number;

  @EnumProperty('Trạng thái', UserStatus, {
    required: true,
  })
  readonly status: UserStatus;
}
