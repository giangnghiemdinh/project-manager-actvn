import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { UseDto, VirtualColumn } from '../../../common/decorators';
import { AbstractEntity } from '../../../common/abstracts';
import { StudentDto } from '../dtos';
import { Gender } from '../../../common/constants';
import { DepartmentEntity } from '../../department/models';
import { ProjectEntity } from '../../project/models';

@Entity({ name: 'students' })
@UseDto(StudentDto)
export class StudentEntity extends AbstractEntity<StudentDto> {
  @Column()
  fullName: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, type: 'timestamp' })
  birthday: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.Male,
  })
  gender: Gender;

  @Column()
  departmentId: number;

  @ManyToOne(() => DepartmentEntity, (department) => department.students, {
    nullable: false,
  })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @ManyToMany(() => ProjectEntity, (project) => project.students)
  projects: ProjectEntity[];

  @VirtualColumn()
  projectCount?: number;
}
