import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dtos';
import { ProjectDto } from './project.dto';

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
