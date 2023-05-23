import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { UserRequestDto } from './user-request.dto';
import { Type } from 'class-transformer';
import { USER_DUPLICATE_EMAIL } from '../../../common/constants';
import { EnumProperty } from '../../../common/decorators';

export class UserImportRequestDto {
  @EnumProperty('Xử lý trùng Email', USER_DUPLICATE_EMAIL, {
    required: true,
  })
  readonly duplicateEmail: USER_DUPLICATE_EMAIL;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => UserRequestDto)
  readonly users: UserRequestDto[];
}
