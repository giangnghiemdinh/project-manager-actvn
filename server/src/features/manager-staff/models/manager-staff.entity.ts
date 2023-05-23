import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { AbstractEntity } from '../../../common/abstracts';
import { ManagerStaffDto } from '../dtos';
import { DepartmentEntity } from '../../department/models';
import { UserEntity } from '../../user/models';
import { ProjectEntity } from '../../project/models';
import { SemesterEntity } from '../../semester/models';

// Cán bộ quản lý
@Entity({ name: 'manager_staff' })
@UseDto(ManagerStaffDto)
export class ManagerStaffEntity extends AbstractEntity<ManagerStaffDto> {
  @Column()
  semesterId: number;

  @ManyToOne(() => SemesterEntity, (semester) => semester.managerCouncils, {
    nullable: false,
  })
  @JoinColumn({ name: 'semester_id' })
  semester: SemesterEntity;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.reviewerStaffs, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => ProjectEntity, (project) => project.managerStaff)
  projects: ProjectEntity[];

  @Column()
  departmentId: number;

  @ManyToOne(() => DepartmentEntity, (department) => department.students, {
    nullable: false,
  })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;
}
