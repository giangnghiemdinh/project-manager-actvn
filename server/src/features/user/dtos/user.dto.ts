import { AbstractDto } from '../../../common/abstracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity } from '../models';
import { Gender, Role } from '../../../common/constants';
import { ProjectDto } from '../../project/dtos';

export class UserDto extends AbstractDto {
  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  gender?: Gender;

  @ApiPropertyOptional()
  birthday?: Date;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  workPlace?: string;

  @ApiPropertyOptional()
  role?: Role;

  @ApiPropertyOptional()
  projects: ProjectDto[];

  @ApiPropertyOptional()
  lastLogin?: Date;

  constructor(user: UserEntity) {
    super(user);
    this.fullName = user.fullName;
    this.email = user.email;
    this.avatar = user.avatar;
    this.phone = user.phone;
    this.isActive = user.isActive;
    this.gender = user.gender;
    this.birthday = user.birthday;
    this.address = user.address;
    this.workPlace = user.workPlace;
    this.lastLogin = user.lastLogin;
    this.role = user.role;
    this.projects = user.projects?.map((p) => p.toDto());
  }
}
