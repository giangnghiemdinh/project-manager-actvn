import { AbstractDto } from '../../../common/abstracts';
import { ManagerStaffEntity } from '../models';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '../../user/dtos';
import { DepartmentDto } from '../../department/dtos';
import { ProjectDto } from '../../project/dtos';
import { SemesterDto } from '../../semester/dtos';

export class ManagerStaffDto extends AbstractDto {
  @ApiPropertyOptional()
  semesterId: number;

  @ApiPropertyOptional()
  departmentId: number;

  @ApiPropertyOptional()
  semester: SemesterDto;

  @ApiPropertyOptional()
  department: DepartmentDto;

  @ApiPropertyOptional()
  user: UserDto;

  @ApiPropertyOptional()
  userId: number;

  @ApiPropertyOptional()
  projects: ProjectDto[];

  constructor(managerStaff: ManagerStaffEntity) {
    super(managerStaff);
    this.semesterId = managerStaff.semesterId;
    this.semester = managerStaff.semester?.toDto();
    this.departmentId = managerStaff.departmentId;
    this.department = managerStaff.department?.toDto();
    this.projects = managerStaff.projects?.map((p) => p.toDto());
    this.userId = managerStaff.userId;
    this.user = managerStaff.user?.toDto();
  }
}
