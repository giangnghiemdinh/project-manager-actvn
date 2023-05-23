import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  PROJECT_DUPLICATE_NAME,
  PROJECT_INSTR_NOT_EXIST,
  PROJECT_STUDENT_NOT_EXIST,
} from '../../../common/constants';
import { Type } from 'class-transformer';
import { Trim } from '../../../common/decorators';

export class ProjectImportRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  semesterId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty()
  @IsEnum(PROJECT_DUPLICATE_NAME)
  @IsNotEmpty()
  readonly duplicateName: PROJECT_DUPLICATE_NAME;

  @ApiProperty()
  @IsEnum(PROJECT_STUDENT_NOT_EXIST)
  @IsNotEmpty()
  readonly studentNotExist: PROJECT_STUDENT_NOT_EXIST;

  @ApiProperty()
  @IsEnum(PROJECT_INSTR_NOT_EXIST)
  @IsNotEmpty()
  readonly instrNotExist: PROJECT_INSTR_NOT_EXIST;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ProjectImport)
  readonly projects: ProjectImport[];
}

export class ProjectImport {
  @ApiProperty()
  @IsString()
  @Trim()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requirement: string;

  @ApiProperty()
  @IsString()
  @Trim()
  @IsNotEmpty()
  instructor: string;
}
