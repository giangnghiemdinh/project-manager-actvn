import { NumberProperty } from '../../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { PointGrade } from '../../../common/dtos';

export class ProjectStatisticalRequestDto {
  @NumberProperty('ID học kỳ', { int: true, min: 1 })
  readonly semesterId?: number;

  @NumberProperty('ID khoa', { int: true, min: 1 })
  readonly departmentId?: number;
}

export class ProjectStatisticalResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  totalRefuse: number;

  @ApiProperty()
  totalExpired: number;

  @ApiProperty()
  totalCompleted: number;

  @ApiProperty()
  totalReview: number;

  @ApiProperty()
  totalPresentation: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  scoreDistribution: { [key: number]: number };

  @ApiProperty()
  presentationPointGrade: PointGrade;

  @ApiProperty()
  instructorPointGrade: PointGrade;

  @ApiProperty()
  reviewerPointGrade: PointGrade;

  constructor(data: {
    total: number;
    totalExpired: number;
    totalRefuse: number;
    totalCompleted: number;
    totalPresentation: number;
    totalReview: number;
    averageScore: number;
    scoreDistribution: { [key: number]: number };
    presentationPointGrade: PointGrade;
    instructorPointGrade: PointGrade;
    reviewerPointGrade: PointGrade;
  }) {
    this.total = data.total;
    this.totalExpired = data.totalExpired;
    this.totalRefuse = data.totalRefuse;
    this.totalCompleted = data.totalCompleted;
    this.totalReview = data.totalReview;
    this.totalPresentation = data.totalPresentation;
    this.averageScore = data.averageScore;
    this.scoreDistribution = data.scoreDistribution;
    this.presentationPointGrade = data.presentationPointGrade;
    this.instructorPointGrade = data.instructorPointGrade;
    this.reviewerPointGrade = data.reviewerPointGrade;
  }
}
