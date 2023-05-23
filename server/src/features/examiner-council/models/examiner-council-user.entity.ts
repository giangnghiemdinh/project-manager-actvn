import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { AbstractEntity } from '../../../common/abstracts';
import { ExaminerCouncilEntity } from './examiner-council.entity';
import { ExaminerCouncilPosition } from '../../../common/constants';
import { UserEntity } from '../../user/models';
import { ExaminerCouncilUserDto } from '../dtos/examiner-council-user.dto';

@Entity({ name: 'examiner_council_user' })
@UseDto(ExaminerCouncilUserDto)
export class ExaminerCouncilUserEntity extends AbstractEntity<ExaminerCouncilUserDto> {
  @Column()
  examinerCouncilId: number;

  @ManyToOne(
    () => ExaminerCouncilEntity,
    (examinerCouncil) => examinerCouncil.users,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'examiner_council_id' })
  examinerCouncil?: ExaminerCouncilEntity;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.examinerCouncils, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ type: 'enum', enum: ExaminerCouncilPosition })
  position: ExaminerCouncilPosition;
}
