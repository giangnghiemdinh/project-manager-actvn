import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class ProgressPayloadDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  semesterId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  proposeStart: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  proposeEnd: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  reportStart: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  reportEnd: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report1Start: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report1End: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report2Start: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report2End: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report3Start: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report3End: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report4Start: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  report4End: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  instrCmtStart: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  instrCmtEnd: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  rvrCmtStart: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  rvrCmtEnd: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  presentStart: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  presentEnd: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  completedStart: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  completedEnd: Date;
}
