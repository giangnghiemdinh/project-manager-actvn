import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentEntity } from '../models';

export class DepartmentDto extends AbstractDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  studentCount?: number;

  constructor(department: DepartmentEntity) {
    super(department);
    this.name = department.name;
    this.shortName = department.shortName;
    this.description = department.description;
    this.studentCount = department.studentCount;
  }
}
