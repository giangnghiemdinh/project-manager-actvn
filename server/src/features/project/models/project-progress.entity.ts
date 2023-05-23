import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UseDto } from '../../../common/decorators';
import { ProjectProgressDto } from '../dtos';
import { AbstractEntity } from '../../../common/abstracts';
import { ProjectEntity } from './project.entity';
import { ProjectProgressType } from '../../../common/constants';

@Entity({ name: 'project_progress' })
@UseDto(ProjectProgressDto)
export class ProjectProgressEntity extends AbstractEntity<ProjectProgressDto> {
  @Column({ type: 'json', nullable: true })
  wordFile: string;

  @Column({ type: 'json', nullable: true })
  reportFile: string;

  @Column({ type: 'json', nullable: true })
  otherFile: string;

  @Column({ type: 'text', nullable: true })
  comment1: string;

  @Column({ type: 'text', nullable: true })
  comment2: string;

  @Column({ type: 'text', nullable: true })
  comment3: string;

  @Column({ type: 'text', nullable: true })
  comment4: string;

  @Column({ type: 'text', nullable: true })
  comment5: string;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ nullable: true })
  folderId: string;

  @Column({ nullable: true })
  isApproval: boolean;

  @Column({ type: 'enum', enum: ProjectProgressType })
  type: ProjectProgressType;

  @Column()
  projectId: number;

  @ManyToOne(() => ProjectEntity, (project) => project.progresses, {
    nullable: false,
  })
  @JoinColumn({ name: 'project_id' })
  project?: ProjectEntity;
}
