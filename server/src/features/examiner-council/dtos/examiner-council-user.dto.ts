import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExaminerCouncilPosition } from '../../../common/constants';
import { ExaminerCouncilUserEntity } from '../models/examiner-council-user.entity';
import { UserDto } from '../../user/dtos';

export class ExaminerCouncilUserDto extends AbstractDto {
  @ApiProperty()
  position: ExaminerCouncilPosition;

  @ApiProperty()
  userId: number;

  @ApiPropertyOptional()
  user: UserDto;

  @ApiProperty()
  examinerCouncilId: number;

  constructor(examinerCouncilUser: ExaminerCouncilUserEntity) {
    super(examinerCouncilUser);
    this.position = examinerCouncilUser.position;
    this.userId = examinerCouncilUser.userId;
    this.user = examinerCouncilUser.user?.toDto();
    this.examinerCouncilId = examinerCouncilUser.examinerCouncilId;
  }
}
