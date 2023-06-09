import { Column, Entity, OneToMany } from 'typeorm';
import { UseDto, VirtualColumn } from '../../../common/decorators';
import { AbstractEntity } from '../../../common/abstracts';
import { SemesterDto } from '../dtos';
import { ProjectEntity } from '../../project/models';
import { ExaminerCouncilEntity } from '../../examiner-council/models';
import { ManagerStaffEntity } from '../../manager-staff/models';

@Entity({ name: 'semesters' })
@UseDto(SemesterDto)
export class SemesterEntity extends AbstractEntity<SemesterDto> {
  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  start: Date;

  @Column({ type: 'timestamp' })
  end: Date;

  @Column({ default: false })
  isLocked: boolean;

  @OneToMany(() => ProjectEntity, (project) => project.semester)
  projects: ProjectEntity[];

  @OneToMany(
    () => ExaminerCouncilEntity,
    (examinerCouncil) => examinerCouncil.semester,
  )
  examinerCouncils: ExaminerCouncilEntity[];

  @OneToMany(
    () => ManagerStaffEntity,
    (managerCouncil) => managerCouncil.semester,
  )
  managerCouncils: ManagerStaffEntity[];

  @VirtualColumn()
  projectCount?: number;
}
