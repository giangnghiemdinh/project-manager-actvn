import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { ProjectDto } from '../../project/dtos';
import { NumberProperty } from '../../../common/decorators';

export class ReviewerRequestDto {
  @NumberProperty('ID học kỳ', { required: true, min: 1, int: true })
  semesterId: number;

  @NumberProperty('ID khoa', { required: true, min: 1, int: true })
  departmentId: number;

  @NumberProperty('ID người dùng', { required: true, min: 1, int: true })
  userId: number;

  @ApiProperty()
  @IsArray()
  projects: ProjectDto[];
}
