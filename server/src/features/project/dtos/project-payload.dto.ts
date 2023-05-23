import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProjectStatus } from '../../../common/constants';
import { StudentDto } from '../../student/dtos';

export class ProjectPayloadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requirement: string;

  @ApiProperty()
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  semesterId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  instructorId: number;

  @ApiProperty()
  @IsArray()
  students: StudentDto[];
}
