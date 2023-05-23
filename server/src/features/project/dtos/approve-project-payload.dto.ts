import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ProjectStatus } from '../../../common/constants';

export class ProjectApprovePayloadDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty()
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;
}
