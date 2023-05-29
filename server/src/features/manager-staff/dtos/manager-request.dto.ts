import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ProjectDto } from '../../project/dtos';
import { NumberProperty } from '../../../common/decorators';

export class ManagerRequestDto {
  @NumberProperty('ID học kỳ', { required: true, int: true, min: 1 })
  semesterId: number;

  @NumberProperty('ID khoa', { required: true, int: true, min: 1 })
  departmentId: number;

  @NumberProperty('ID người dùng', { required: true, int: true, min: 1 })
  userId: number;

  @ApiProperty()
  @IsArray()
  projects: ProjectDto[];
}
