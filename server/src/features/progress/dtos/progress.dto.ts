import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgressEntity } from '../models';
import { DepartmentDto } from '../../department/dtos';
import { SemesterDto } from '../../semester/dtos';

export class ProgressDto extends AbstractDto {
  @ApiProperty()
  semesterId: number;

  @ApiPropertyOptional()
  semester?: SemesterDto;

  @ApiProperty()
  departmentId: number;

  @ApiPropertyOptional()
  department?: DepartmentDto;

  @ApiProperty()
  proposeStart: Date;

  @ApiProperty()
  proposeEnd: Date;

  @ApiProperty()
  reportStart: Date;

  @ApiProperty()
  reportEnd: Date;

  @ApiProperty()
  report1Start: Date;

  @ApiProperty()
  report1End: Date;

  @ApiProperty()
  report2Start: Date;

  @ApiProperty()
  report2End: Date;

  @ApiProperty()
  report3Start: Date;

  @ApiProperty()
  report3End: Date;

  @ApiProperty()
  report4Start: Date;

  @ApiProperty()
  report4End: Date;

  @ApiProperty()
  instrCmtStart: Date;

  @ApiProperty()
  instrCmtEnd: Date;

  @ApiProperty()
  rvrCmtStart: Date;

  @ApiProperty()
  rvrCmtEnd: Date;

  @ApiProperty()
  presentStart: Date;

  @ApiProperty()
  presentEnd: Date;

  @ApiProperty()
  completedStart: Date;

  @ApiProperty()
  completedEnd: Date;

  constructor(progress: ProgressEntity) {
    super(progress);
    this.semesterId = progress.semesterId;
    this.semester = progress.semester?.toDto();
    this.departmentId = progress.departmentId;
    this.department = progress.department?.toDto();
    this.proposeStart = progress.proposeStart;
    this.proposeEnd = progress.proposeEnd;
    this.reportStart = progress.reportStart;
    this.reportEnd = progress.reportEnd;
    this.report1Start = progress.report1Start;
    this.report1End = progress.report1End;
    this.report2Start = progress.report2Start;
    this.report2End = progress.report2End;
    this.report3Start = progress.report3Start;
    this.report3End = progress.report3End;
    this.report4Start = progress.report4Start;
    this.report4End = progress.report4End;
    this.instrCmtStart = progress.instrCmtStart;
    this.instrCmtEnd = progress.instrCmtEnd;
    this.rvrCmtStart = progress.rvrCmtStart;
    this.rvrCmtEnd = progress.rvrCmtEnd;
    this.presentStart = progress.presentStart;
    this.presentEnd = progress.presentEnd;
    this.completedStart = progress.completedStart;
    this.completedEnd = progress.completedEnd;
  }
}
