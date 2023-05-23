import { AbstractDto } from '../../../common/abstracts';
import { ProjectProgressEntity } from '../models/project-progress.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectProgressType } from '../../../common/constants';
import { ProjectEntity } from '../models';

export class ProjectProgressDto extends AbstractDto {
  @ApiProperty()
  wordFile: string;

  @ApiProperty()
  reportFile: string;

  @ApiProperty()
  otherFile: string;

  @ApiProperty()
  comment1: string;

  @ApiProperty()
  comment2: string;

  @ApiProperty()
  comment3: string;

  @ApiProperty()
  comment4: string;

  @ApiProperty()
  comment5: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  isApproval: boolean;

  @ApiProperty()
  type: ProjectProgressType;

  @ApiProperty()
  projectId: number;

  @ApiPropertyOptional()
  project?: ProjectEntity;

  constructor(projectProgress: ProjectProgressEntity) {
    super(projectProgress);
    this.wordFile = projectProgress.wordFile;
    this.reportFile = projectProgress.reportFile;
    this.otherFile = projectProgress.otherFile;
    this.comment1 = projectProgress.comment1;
    this.comment2 = projectProgress.comment2;
    this.comment3 = projectProgress.comment3;
    this.comment4 = projectProgress.comment4;
    this.comment5 = projectProgress.comment5;
    this.score = projectProgress.score;
    this.isApproval = projectProgress.isApproval;
    this.type = projectProgress.type;
    this.projectId = projectProgress.projectId;
  }
}
