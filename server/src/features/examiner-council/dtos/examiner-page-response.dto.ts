import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dtos';
import { ExaminerCouncilDto } from './examiner-council.dto';

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
