import { AbstractDto } from '../../../common/abstracts';
import { ReviewerStaffEntity } from '../models';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from '../../user/dtos';
import { DepartmentDto } from '../../department/dtos';
import { ProjectDto } from '../../project/dtos';
import { SemesterDto } from '../../semester/dtos';

export class ReviewerStaffDto extends AbstractDto {
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

  constructor(reviewerStaff: ReviewerStaffEntity) {
    super(reviewerStaff);
    this.semesterId = reviewerStaff.semesterId;
    this.semester = reviewerStaff.semester?.toDto();
    this.departmentId = reviewerStaff.departmentId;
    this.department = reviewerStaff.department?.toDto();
    this.projects = reviewerStaff.projects?.map((p) => p.toDto());
    this.userId = reviewerStaff.userId;
    this.user = reviewerStaff.user?.toDto();
  }
}
