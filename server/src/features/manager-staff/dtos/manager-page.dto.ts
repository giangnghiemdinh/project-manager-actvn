import { PaginationMetaDto, PaginationOptionsDto } from '../../../common/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { ManagerStaffDto } from './manager-staff.dto';
import { NumberProperty } from '../../../common/decorators';

export class ManagerPageRequestDto extends PaginationOptionsDto {
  @NumberProperty('ID khoa', { int: true, min: 1 })
  readonly departmentId?: number;

  @NumberProperty('ID học kỳ', { int: true, min: 1 })
  readonly semesterId?: number;
}

export class ManagerPageResponseDto {
  @ApiProperty({
    type: ManagerStaffDto,
    isArray: true,
  })
  readonly data: ManagerStaffDto[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(data: ManagerStaffDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
