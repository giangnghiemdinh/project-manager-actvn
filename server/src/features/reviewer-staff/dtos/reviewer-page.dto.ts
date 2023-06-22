import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { NumberProperty } from '../../../common/decorators';
import { ReviewerStaffDto } from './reviewer-staff.dto';

export class ReviewerPageRequestDto extends PaginationOptionsDto {
  @NumberProperty('ID khoa', { int: true, min: 1 })
  readonly departmentId?: number;

  @NumberProperty('ID học kỳ', { int: true, min: 1 })
  readonly semesterId?: number;
}

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
