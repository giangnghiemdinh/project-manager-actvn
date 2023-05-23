import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class ProjectCouncilReviewRequestDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(15)
  @IsNotEmpty()
  formScore: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(35)
  @IsNotEmpty()
  contentScore: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(20)
  @IsNotEmpty()
  summarizeScore: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(30)
  @IsNotEmpty()
  answerScore: number;

  @ApiProperty()
  @IsNotEmpty()
  conclusionScore: number;
}
