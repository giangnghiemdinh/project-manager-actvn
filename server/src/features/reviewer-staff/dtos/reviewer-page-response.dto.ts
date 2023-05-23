import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dtos';
import { ReviewerStaffDto } from './reviewer-staff.dto';

export class ReviewerPageResponseDto {
  @ApiProperty({
    type: ReviewerStaffDto,
    isArray: true,
  })
  readonly data: ReviewerStaffDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: ReviewerStaffDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
