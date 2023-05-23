import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepartmentDto } from '../../department/dtos';
import { Gender } from '../../../common/constants';
import { StudentEntity } from '../models';
import { ProjectDto } from '../../project/dtos';

export class StudentDto extends AbstractDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  birthday: Date;

  @ApiProperty()
  department: DepartmentDto;

  @ApiProperty()
  gender: Gender;

  @ApiProperty()
  departmentId: number;

  @ApiPropertyOptional()
  projects: ProjectDto[];

  constructor(student: StudentEntity) {
    super(student);
    this.fullName = student.fullName;
    this.code = student.code;
    this.phone = student.phone;
    this.email = student.email;
    this.birthday = student.birthday;
    this.gender = student.gender;
    this.departmentId = student.departmentId;
    this.department = student.department?.toDto();
    this.projects = student.projects?.map((p) => p.toDto());
  }
}
