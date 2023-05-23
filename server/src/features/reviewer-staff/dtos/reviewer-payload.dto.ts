import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { ProjectDto } from '../../project/dtos';

export class ReviewerPayloadDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  semesterId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  @IsArray()
  projects: ProjectDto[];
}
