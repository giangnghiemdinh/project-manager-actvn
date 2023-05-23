import { AbstractDto } from '../../../common/abstracts';
import { ExaminerCouncilEntity } from '../models';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentDto } from '../../department/dtos';
import { ProjectDto } from '../../project/dtos';
import { SemesterDto } from '../../semester/dtos';
import { ExaminerCouncilUserDto } from './examiner-council-user.dto';

export class ExaminerCouncilDto extends AbstractDto {
  @ApiPropertyOptional()
  semesterId: number;

  @ApiPropertyOptional()
  semester: SemesterDto;

  @ApiPropertyOptional()
  departmentId: number;

  @ApiPropertyOptional()
  department: DepartmentDto;

  @ApiPropertyOptional()
  users: ExaminerCouncilUserDto[];

  @ApiPropertyOptional()
  projects: ProjectDto[];

  @ApiPropertyOptional()
  location: string;

  constructor(examinerCouncil: ExaminerCouncilEntity) {
    super(examinerCouncil);
    this.location = examinerCouncil.location;
    this.semesterId = examinerCouncil.semesterId;
    this.semester = examinerCouncil.semester?.toDto();
    this.departmentId = examinerCouncil.departmentId;
    this.department = examinerCouncil.department?.toDto();
    this.projects = examinerCouncil.projects?.map((p) => p.toDto());
    this.users = examinerCouncil.users?.map((u) => u.toDto());
  }
}
