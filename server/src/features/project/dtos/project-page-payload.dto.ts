import { PaginationOptionsDto } from '../../../common/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectQueryState } from '../../../common/constants';

export class ProjectPagePayloadDto extends PaginationOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly departmentId?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly semesterId?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsEnum(ProjectQueryState)
  @IsOptional()
  readonly state?: ProjectQueryState;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly status?: string;
}
