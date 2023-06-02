import { ApiPropertyOptional } from '@nestjs/swagger';

export class PointGrade {
  @ApiPropertyOptional()
  'F'?: number;

  @ApiPropertyOptional()
  'D'?: number;

  @ApiPropertyOptional()
  'D+'?: number;

  @ApiPropertyOptional()
  'C'?: number;

  @ApiPropertyOptional()
  'C+'?: number;

  @ApiPropertyOptional()
  'B'?: number;

  @ApiPropertyOptional()
  'B+'?: number;

  @ApiPropertyOptional()
  'A'?: number;

  @ApiPropertyOptional()
  'A+'?: number;
}
