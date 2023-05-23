import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dtos';
import { StudentDto } from './student.dto';

export class StudentPageResponseDto {
  @ApiProperty({
    type: StudentDto,
    isArray: true,
  })
  readonly data: StudentDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: StudentDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
