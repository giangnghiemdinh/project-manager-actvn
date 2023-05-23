import { PaginationOptionsDto } from '../../../common/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ReviewerPagePayloadDto extends PaginationOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly departmentId?: number;
}
