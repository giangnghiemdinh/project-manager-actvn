import { AbstractEntity } from '../../../common/abstracts';
import { DepartmentDto } from '../dtos';
import { Column, Entity, OneToMany } from 'typeorm';
import { UseDto, VirtualColumn } from '../../../common/decorators';
import { StudentEntity } from '../../student/models';
import { ProjectEntity } from '../../project/models';
import { ExaminerCouncilEntity } from '../../examiner-council/models';
import { ManagerStaffEntity } from '../../manager-staff/models';
import { ProgressEntity } from '../../progress/models';

@Entity({ name: 'departments' })
@UseDto(DepartmentDto)
export class DepartmentEntity extends AbstractEntity<DepartmentDto> {
  @Column()
  name: string;

  @Column()
  shortName: string;

  @Column({ nullable: true })
  description?: string;

  @VirtualColumn()
  userCount: number;

  @OneToMany(() => StudentEntity, (student) => student.department)
  students: StudentEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.department)
  projects: ProjectEntity[];

  @OneToMany(() => ProgressEntity, (progress) => progress.department)
  progresses: ProgressEntity[];

  @OneToMany(
    () => ExaminerCouncilEntity,
    (examinerCouncil) => examinerCouncil.department,
  )
  examinerCouncils: ExaminerCouncilEntity[];

  @OneToMany(
    () => ManagerStaffEntity,
    (managerCouncil) => managerCouncil.department,
  )
  managerCouncils: ManagerStaffEntity[];

  @VirtualColumn()
  studentCount: number;
}
