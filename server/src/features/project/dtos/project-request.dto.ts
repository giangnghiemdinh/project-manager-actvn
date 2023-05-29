import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { ProjectStatus } from '../../../common/constants';
import { NumberProperty, StringProperty } from '../../../common/decorators';
import { Type } from 'class-transformer';

export class ProjectRequestDto {
  @StringProperty('Tên đề tài', { required: true })
  readonly name: string;

  @StringProperty('Mô tả', { required: true })
  readonly description: string;

  @StringProperty('Yêu cầu', { required: true })
  readonly requirement: string;

  @NumberProperty('ID học kỳ', { required: true, int: true, min: 1 })
  readonly semesterId: number;

  @NumberProperty('ID khoa', { required: true, int: true, min: 1 })
  readonly departmentId: number;

  @NumberProperty('ID người hướng dẫn', { required: true, int: true, min: 1 })
  readonly instructorId: number;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ProjectStudentRequestDto)
  students: ProjectStudentRequestDto[];

  status: ProjectStatus;

  createdById?: number;
}

export class ProjectStudentRequestDto {
  @NumberProperty('ID sinh viên', { required: true, int: true, min: 1 })
  readonly id: number;

  @StringProperty('Tên sinh viên')
  readonly fullName?: string;
}
