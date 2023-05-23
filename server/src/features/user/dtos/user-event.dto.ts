import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserEventEntity } from '../models';
import { UserDto } from './user.dto';

export class UserEventDto extends AbstractDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  userId?: number;

  @ApiProperty()
  user?: UserDto;

  @ApiPropertyOptional()
  params: string;

  constructor(userEvent: UserEventEntity) {
    super(userEvent);
    this.message = userEvent.message;
    this.params = userEvent.params;
    this.userId = userEvent.userId;
    this.user = userEvent.user?.toDto();
  }
}
