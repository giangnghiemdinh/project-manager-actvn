import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectEntity } from '../models';
import { ProjectStatus } from '../../../common/constants';
import { DepartmentDto } from '../../department/dtos';
import { UserDto } from '../../user/dtos';
import { StudentDto } from '../../student/dtos';
import { ManagerStaffDto } from '../../manager-staff/dtos';
import { ProgressDto } from '../../progress/dtos';
import { SemesterDto } from '../../semester/dtos';
import { ReviewerStaffDto } from '../../reviewer-staff/dtos';
import { ExaminerCouncilDto } from '../../examiner-council/dtos';

export class ProjectDto extends AbstractDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  requirement: string;

  @ApiProperty()
  status: ProjectStatus;

  @ApiProperty()
  semesterId: number;

  @ApiProperty()
  departmentId: number;

  @ApiPropertyOptional()
  semester?: SemesterDto;

  @ApiPropertyOptional()
  department?: DepartmentDto;

  @ApiProperty()
  instructorId: number;

  @ApiPropertyOptional()
  instructor?: UserDto;

  @ApiPropertyOptional()
  students?: StudentDto[];

  @ApiPropertyOptional()
  managerStaffId?: number;

  @ApiPropertyOptional()
  managerStaff: ManagerStaffDto;

  @ApiPropertyOptional()
  reviewerStaffId: number;

  @ApiPropertyOptional()
  reviewerStaff: ReviewerStaffDto;

  @ApiPropertyOptional()
  examinerCouncilId: number;

  @ApiPropertyOptional()
  examinerCouncil: ExaminerCouncilDto;

  @ApiPropertyOptional()
  reviewedBy: UserDto;

  @ApiPropertyOptional()
  reason: string;

  @ApiPropertyOptional()
  progresses: ProgressDto[];

  @ApiPropertyOptional()
  formScore: number;

  @ApiPropertyOptional()
  contentScore: number;

  @ApiPropertyOptional()
  summarizeScore: number;

  @ApiPropertyOptional()
  answerScore: number;

  @ApiPropertyOptional()
  conclusionScore: number;

  constructor(project: ProjectEntity) {
    super(project);
    this.name = project.name;
    this.description = project.description;
    this.requirement = project.requirement;
    this.status = project.status;
    this.semesterId = project.semesterId;
    this.departmentId = project.departmentId;
    this.reason = project.reason;
    this.semester = project.semester?.toDto();
    this.department = project.department?.toDto();
    this.instructorId = project.instructorId;
    this.instructor = project.instructor?.toDto();
    this.students = project.students?.map((s) => s.toDto());
    this.managerStaffId = project.managerStaffId;
    this.managerStaff = project.managerStaff?.toDto();
    this.reviewerStaffId = project.reviewerStaffId;
    this.reviewerStaff = project.reviewerStaff?.toDto();
    this.examinerCouncilId = project.examinerCouncilId;
    this.examinerCouncil = project.examinerCouncil?.toDto();
    this.reviewedBy = project.reviewedBy?.toDto();
    this.progresses = project.progresses?.map((p) => p.toDto());
    this.formScore = project.formScore;
    this.contentScore = project.contentScore;
    this.summarizeScore = project.summarizeScore;
    this.answerScore = project.answerScore;
    this.conclusionScore = project.conclusionScore;
  }
}
