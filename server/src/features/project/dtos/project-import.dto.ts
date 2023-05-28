import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import {
  PROJECT_DUPLICATE_NAME,
  PROJECT_INSTR_NOT_EXIST,
  PROJECT_STUDENT_NOT_EXIST,
} from '../../../common/constants';
import { Type } from 'class-transformer';
import {
  EnumProperty,
  NumberProperty,
  StringProperty,
} from '../../../common/decorators';

export class ProjectImportRequestDto {
  @NumberProperty('ID học kỳ', { required: true, int: true, min: 1 })
  semesterId: number;

  @NumberProperty('ID khoa', { required: true, int: true, min: 1 })
  departmentId: number;

  @EnumProperty('Xử lý trùng tên đề tài', PROJECT_DUPLICATE_NAME, {
    required: true,
  })
  readonly duplicateName: PROJECT_DUPLICATE_NAME;

  @EnumProperty('Xử lý sinh viên không tồn tại', PROJECT_STUDENT_NOT_EXIST, {
    required: true,
  })
  readonly studentNotExist: PROJECT_STUDENT_NOT_EXIST;

  @EnumProperty(
    'Xử lý người hướng dẫn không tồn tại',
    PROJECT_INSTR_NOT_EXIST,
    { required: true },
  )
  readonly instrNotExist: PROJECT_INSTR_NOT_EXIST;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ProjectImport)
  readonly projects: ProjectImport[];
}

export class ProjectImport {
  @StringProperty('Tên đề tài', { required: true })
  name: string;

  @StringProperty('Mô tả đề tài', { required: true })
  description: string;

  @StringProperty('Yêu cầu', { required: true, trim: false })
  requirement: string;

  @StringProperty('Người hướng dẫn', { required: true })
  instructor: string;
}
