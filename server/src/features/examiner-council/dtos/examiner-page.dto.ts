import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { ExaminerCouncilDto } from './examiner-council.dto';
import { NumberProperty } from '../../../common/decorators';

export class ExaminerPageRequestDto extends PaginationOptionsDto {
  @NumberProperty('ID khoa', { int: true, min: 1 })
  readonly departmentId?: number;
}

export class ExaminerPageResponseDto {
  @ApiProperty({
    type: ExaminerCouncilDto,
    isArray: true,
  })
  readonly data: ExaminerCouncilDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: ExaminerCouncilDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
