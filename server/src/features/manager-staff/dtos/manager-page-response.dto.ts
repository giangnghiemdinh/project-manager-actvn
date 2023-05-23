import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dtos';
import { ManagerStaffDto } from './manager-staff.dto';

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
