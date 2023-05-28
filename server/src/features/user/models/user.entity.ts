import { AbstractEntity } from '../../../common/abstracts';
import { UserDto } from '../dtos';
import { Column, Entity, OneToMany } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { UserEventEntity } from './user-event.entity';
import { UserSessionEntity } from './user-session.entity';
import { Gender, Role, TwoFactoryMethod } from '../../../common/constants';
import { ProjectEntity } from '../../project/models';
import { ExaminerCouncilEntity } from '../../examiner-council/models';
import { ManagerStaffEntity } from '../../manager-staff/models';
import { ReviewerStaffEntity } from '../../reviewer-staff/models';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto> {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.Male,
  })
  gender: Gender;

  @Column({ type: 'timestamp', nullable: true })
  birthday?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  workPlace?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({
    type: 'enum',
    enum: TwoFactoryMethod,
    default: TwoFactoryMethod.DISABLED,
    comment: '0 - Disabled | 1 - Email | 2 - OTP',
  })
  twoFactory: TwoFactoryMethod;

  @Column({ nullable: true })
  optSecret?: string;

  @Column({ type: 'enum', enum: Role, default: Role.LECTURER })
  role: Role;

  @OneToMany(() => UserSessionEntity, (userSessions) => userSessions.user)
  sessions?: UserSessionEntity[];

  @OneToMany(() => UserEventEntity, (userEvents) => userEvents.user)
  events?: UserEventEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.instructor)
  projects: ProjectEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.reviewedBy)
  reviewedProjects: ProjectEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.proposeBy)
  proposeProjects: ProjectEntity[];

  @OneToMany(
    () => ExaminerCouncilEntity,
    (examinerCouncil) => examinerCouncil.users,
  )
  examinerCouncils: ExaminerCouncilEntity[];

  @OneToMany(() => ManagerStaffEntity, (managerStaff) => managerStaff.user)
  managerStaffs: ManagerStaffEntity[];

  @OneToMany(() => ManagerStaffEntity, (reviewerStaff) => reviewerStaff.user)
  reviewerStaffs: ReviewerStaffEntity[];
}
