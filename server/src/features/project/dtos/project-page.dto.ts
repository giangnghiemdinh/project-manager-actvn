import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectQueryState } from '../../../common/constants';
import { ProjectDto } from './project.dto';
import {
  EnumProperty,
  NumberProperty,
  StringProperty,
} from '../../../common/decorators';

export class ProjectPageRequestDto extends PaginationOptionsDto {
  @NumberProperty('ID khoa', { int: true, min: 1 })
  readonly departmentId?: number;

  @NumberProperty('ID học kỳ', { int: true, min: 1 })
  readonly semesterId?: number;

  @EnumProperty('Phân loại', ProjectQueryState)
  readonly state?: ProjectQueryState;

  @StringProperty('Trạng thái')
  readonly status?: string;

  @StringProperty('Khác')
  readonly extra?: string;
}

export class ProjectPageResponseDto {
  @ApiProperty({
    type: ProjectDto,
    isArray: true,
  })
  readonly data: ProjectDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: ProjectDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
