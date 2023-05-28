import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { NumberProperty } from '../../../common/decorators';
import { StudentDto } from './student.dto';

export class StudentPageRequestDto extends PaginationOptionsDto {
  @NumberProperty('Khoa', { int: true, min: 1 })
  readonly departmentId?: number;
}

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
