import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { AbstractEntity } from '../../../common/abstracts';
import { ExaminerCouncilDto } from '../dtos';
import { ProjectEntity } from '../../project/models';
import { DepartmentEntity } from '../../department/models';
import { SemesterEntity } from '../../semester/models';
import { ExaminerCouncilUserEntity } from './examiner-council-user.entity';

// Hội đồng bảo vệ
@Entity({ name: 'examiner_council' })
@UseDto(ExaminerCouncilDto)
export class ExaminerCouncilEntity extends AbstractEntity<ExaminerCouncilDto> {
  @Column()
  semesterId: number;

  @ManyToOne(() => SemesterEntity, (semester) => semester.examinerCouncils, {
    nullable: false,
  })
  @JoinColumn({ name: 'semester_id' })
  semester: SemesterEntity;

  @Column()
  departmentId: number;

  @ManyToOne(() => DepartmentEntity, (department) => department.students, {
    nullable: false,
  })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @Column()
  location: string;

  @OneToMany(
    () => ExaminerCouncilUserEntity,
    (users) => users.examinerCouncil,
    {
      cascade: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  users: ExaminerCouncilUserEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.examinerCouncil)
  projects: ProjectEntity[];
}
