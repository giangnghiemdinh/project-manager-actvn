import { EnumProperty } from '../../../common/decorators';
import { STUDENT_DUPLICATE_CODE } from '../../../common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StudentRequestDto } from './student-request.dto';

export class StudentImportRequestDto {
  @EnumProperty('Xử lý trùng Email', STUDENT_DUPLICATE_CODE, {
    required: true,
  })
  readonly duplicateCode: STUDENT_DUPLICATE_CODE;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => StudentRequestDto)
  readonly students: StudentRequestDto[];
}
