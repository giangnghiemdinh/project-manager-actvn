import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { Role } from '../../../common/constants';
import {
  BooleanProperty,
  EnumProperty,
  StringProperty,
} from '../../../common/decorators';

export class UserPageRequestDto extends PaginationOptionsDto {
  @EnumProperty('Vai trò', Role)
  readonly role?: Role;

  @BooleanProperty('Trạng thái')
  readonly isActive?: number;

  @StringProperty('Thêm')
  readonly extra?: string;
}

export class UserPageResponseDto {
  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  readonly data: UserDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: UserDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
