import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Trim } from '../../../common/decorators';
import { ProjectDto } from '../../project/dtos';
import { ExaminerCouncilUserDto } from './examiner-council-user.dto';

export class ExaminerPayloadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Trim()
  location: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  semesterId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty()
  @IsArray()
  users: ExaminerCouncilUserDto[];

  @ApiProperty()
  @IsArray()
  projects: ProjectDto[];
}
