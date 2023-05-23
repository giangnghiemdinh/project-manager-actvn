import { AbstractDto } from '../../../common/abstracts';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterEntity } from '../models';

export class SemesterDto extends AbstractDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  isLocked: boolean;

  @ApiProperty()
  start: Date;

  @ApiProperty()
  end: Date;

  constructor(semester: SemesterEntity) {
    super(semester);
    this.name = semester.name;
    this.isLocked = semester.isLocked;
    this.start = semester.start;
    this.end = semester.end;
  }
}
