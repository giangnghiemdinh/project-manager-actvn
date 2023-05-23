import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/decorators';
import { ProjectProgressType } from '../../../common/constants';

export class ProjectReviewRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Trim()
  comment1: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Trim()
  comment2: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Trim()
  comment3: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Trim()
  comment4: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Trim()
  comment5: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  score: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isApproval: boolean;

  @ApiProperty()
  @IsEnum(ProjectProgressType)
  @IsNotEmpty()
  type: ProjectProgressType;
}
