import { AbstractEntity } from '../../../common/abstracts';
import { ProgressDto } from '../dtos';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { DepartmentEntity } from '../../department/models';
import { SemesterEntity } from '../../semester/models';

@Entity({ name: 'progress' })
@UseDto(ProgressDto)
export class ProgressEntity extends AbstractEntity<ProgressDto> {
  @Column()
  semesterId: number;

  @ManyToOne(() => SemesterEntity, (semester) => semester.progresses, {
    nullable: false,
  })
  @JoinColumn({ name: 'semester_id' })
  semester: SemesterEntity;

  @Column()
  departmentId: number;

  @ManyToOne(() => DepartmentEntity, (department) => department.progresses, {
    nullable: false,
  })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  // Thời gian đề xuất
  @Column({ type: 'timestamp' })
  proposeStart: Date;

  @Column({ type: 'timestamp' })
  proposeEnd: Date;

  // Thời gian nộp đề cương
  @Column({ type: 'timestamp' })
  reportStart: Date;

  @Column({ type: 'timestamp' })
  reportEnd: Date;

  // Báo cáo tiến độ L1
  @Column({ type: 'timestamp' })
  report1Start: Date;

  @Column({ type: 'timestamp' })
  report1End: Date;

  // Báo cáo tiến độ L2
  @Column({ type: 'timestamp' })
  report2Start: Date;

  @Column({ type: 'timestamp' })
  report2End: Date;

  // Báo cáo tiến độ L3
  @Column({ type: 'timestamp' })
  report3Start: Date;

  @Column({ type: 'timestamp' })
  report3End: Date;

  // Báo cáo tiến độ L4
  @Column({ type: 'timestamp' })
  report4Start: Date;

  @Column({ type: 'timestamp' })
  report4End: Date;

  // GVHD nhận xét
  @Column({ type: 'timestamp' })
  instrCmtStart: Date;

  @Column({ type: 'timestamp' })
  instrCmtEnd: Date;

  // GVPB nhận xét
  @Column({ type: 'timestamp' })
  rvrCmtStart: Date;

  @Column({ type: 'timestamp' })
  rvrCmtEnd: Date;

  // Bảo vệ
  @Column({ type: 'timestamp' })
  presentStart: Date;

  @Column({ type: 'timestamp' })
  presentEnd: Date;

  // Nộp đồ án hoàn chỉnh
  @Column({ type: 'timestamp' })
  completedStart: Date;

  @Column({ type: 'timestamp' })
  completedEnd: Date;
}
