import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { UserEventDto } from './user-event.dto';
import { NumberProperty } from '../../../common/decorators';

export class UserEventPageRequestDto extends PaginationOptionsDto {
  @NumberProperty('ID người dùng', {
    int: true,
    min: 1,
  })
  readonly userId?: number;
}

export class UserEventPageResponseDto {
  @ApiProperty({
    type: UserEventDto,
    isArray: true,
  })
  readonly data: UserEventDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: UserEventDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
