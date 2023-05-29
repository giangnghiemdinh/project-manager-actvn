import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { NumberProperty, StringProperty } from '../../../common/decorators';
import { ProjectDto } from '../../project/dtos';
import { ExaminerCouncilUserDto } from './examiner-council-user.dto';

export class ExaminerRequestDto {
  @StringProperty('Địa điểm', { required: true })
  location: string;

  @NumberProperty('ID học kỳ', { required: true, int: true, min: 1 })
  semesterId: number;

  @NumberProperty('ID khoa', { required: true, int: true, min: 1 })
  departmentId: number;

  @ApiProperty()
  @IsArray()
  users: ExaminerCouncilUserDto[];

  @ApiProperty()
  @IsArray()
  projects: ProjectDto[];
}
