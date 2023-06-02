import { AbstractDto } from '../../../common/abstracts';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity } from '../models';
import {
  Gender,
  Rank,
  Role,
  TwoFactoryMethod,
} from '../../../common/constants';
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
  rank?: Rank;

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

  @ApiPropertyOptional()
  twoFactory?: TwoFactoryMethod;

  constructor(user: UserEntity) {
    super(user);
    this.fullName = user.fullName;
    this.email = user.email;
    this.avatar = user.avatar;
    this.phone = user.phone;
    this.isActive = user.isActive;
    this.gender = user.gender;
    this.rank = user.rank;
    this.birthday = user.birthday;
    this.address = user.address;
    this.workPlace = user.workPlace;
    this.lastLogin = user.lastLogin;
    this.role = user.role;
    this.twoFactory = user.twoFactory;
    this.projects = user.projects?.map((p) => p.toDto());
  }
}
