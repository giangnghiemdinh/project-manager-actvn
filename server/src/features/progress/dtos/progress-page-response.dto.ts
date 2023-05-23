import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dtos';
import { ProgressDto } from './progress.dto';

export class ProgressPageResponseDto {
  @ApiProperty({
    type: ProgressDto,
    isArray: true,
  })
  readonly data: ProgressDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: ProgressDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
