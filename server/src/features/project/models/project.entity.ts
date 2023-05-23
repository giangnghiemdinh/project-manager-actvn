import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { AbstractEntity } from '../../../common/abstracts';
import { ProjectDto } from '../dtos';
import { ProjectStatus } from '../../../common/constants';
import { DepartmentEntity } from '../../department/models';
import { UserEntity } from '../../user/models';
import { StudentEntity } from '../../student/models';
import { ProjectProgressEntity } from './project-progress.entity';
import { ProgressEntity } from '../../progress/models';
import { ExaminerCouncilEntity } from '../../examiner-council/models';
import { ManagerStaffEntity } from '../../manager-staff/models';
import { SemesterEntity } from '../../semester/models';
import { ReviewerStaffEntity } from '../../reviewer-staff/models';

@Entity({ name: 'projects' })
@UseDto(ProjectDto)
export class ProjectEntity extends AbstractEntity<ProjectDto> {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  requirement: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PROPOSE })
  status: ProjectStatus;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  folderId: string;

  @Column({ nullable: true })
  semesterId: number;

  @ManyToOne(() => SemesterEntity, (semester) => semester.projects, {
    nullable: true,
  })
  @JoinColumn({ name: 'semester_id' })
  semester: SemesterEntity;

  @Column()
  departmentId: number;

  @ManyToOne(() => DepartmentEntity, (department) => department.projects, {
    nullable: false,
  })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @Column()
  instructorId: number;

  @ManyToOne(() => UserEntity, (user) => user.projects, {
    nullable: false,
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserEntity;

  @Column({ nullable: true })
  reviewedById: number;

  @ManyToOne(() => UserEntity, (user) => user.reviewedProjects, {})
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: UserEntity;

  @Column({ nullable: true })
  examinerCouncilId: number;

  @ManyToOne(
    () => ExaminerCouncilEntity,
    (examinerCouncil) => examinerCouncil.projects,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'examiner_council_id' })
  examinerCouncil?: ExaminerCouncilEntity;

  @Column({ nullable: true })
  reviewerStaffId: number;

  @ManyToOne(
    () => ReviewerStaffEntity,
    (reviewerStaff) => reviewerStaff.projects,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'reviewer_staff_id' })
  reviewerStaff?: ReviewerStaffEntity;

  @Column({ nullable: true })
  managerStaffId: number;

  @ManyToOne(
    () => ManagerStaffEntity,
    (managerStaff) => managerStaff.projects,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'manager_staff_id' })
  managerStaff?: ManagerStaffEntity;

  @ManyToMany(() => StudentEntity, (student) => student.projects)
  @JoinTable({ name: 'project_student' })
  students: StudentEntity[];

  @OneToMany(() => ProjectProgressEntity, (progress) => progress.project)
  progresses: ProgressEntity[];

  @Column({ nullable: true })
  formScore: number;

  @Column({ nullable: true })
  contentScore: number;

  @Column({ nullable: true })
  summarizeScore: number;

  @Column({ nullable: true })
  answerScore: number;

  @Column({ type: 'float', nullable: true })
  conclusionScore: number;
}
