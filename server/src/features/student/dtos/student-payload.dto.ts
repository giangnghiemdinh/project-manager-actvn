import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Gender } from '../../../common/constants';
import { ToUpperCase, Trim } from '../../../common/decorators';

export class StudentPayloadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Trim()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  @ToUpperCase()
  code: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty()
  @IsDateString()
  birthday?: Date;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  departmentId: number;
}
