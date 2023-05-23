import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { UserSessionDto } from './user-session.dto';
import { NumberProperty } from '../../../common/decorators';

export class UserSessionPageRequestDto extends PaginationOptionsDto {
  @NumberProperty('ID người dùng', {
    int: true,
    min: 1,
  })
  readonly userId?: number;
}

export class UserSessionPageResponseDto {
  @ApiProperty({
    type: UserSessionDto,
    isArray: true,
  })
  readonly data: UserSessionDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: UserSessionDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
