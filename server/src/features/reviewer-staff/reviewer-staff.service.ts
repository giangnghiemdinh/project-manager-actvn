import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination, PaginationMetaDto } from '../../common/dtos';
import { ReviewerStaffEntity } from './models';
import {
  ReviewerPagePayloadDto,
  ReviewerPageResponseDto,
  ReviewerPayloadDto,
  ReviewerStaffDto,
} from './dtos';
import { Transactional } from 'typeorm-transactional';
import { ProjectService } from '../project/project.service';
import { ProjectProgressType, ProjectStatus } from 'src/common/constants';

@Injectable()
export class ReviewerStaffService {
  private readonly logger = new Logger(ReviewerStaffService.name);

  constructor(
    @InjectRepository(ReviewerStaffEntity)
    private reviewerStaffRepository: Repository<ReviewerStaffEntity>,

    private readonly projectService: ProjectService,
  ) {}

  async getReviewerStaffs(
    pageOptionsDto: ReviewerPagePayloadDto,
  ): Promise<Pagination<ReviewerStaffDto>> {
    const queryBuilder = this.reviewerStaffRepository
      .createQueryBuilder('reviewerStaff')
      .leftJoin('reviewerStaff.user', 'user');

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(user.fullName) LIKE :q ', {
        q: `${pageOptionsDto.q.toUpperCase()}`,
      });
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('reviewerStaff.departmentId = :id', {
        id: pageOptionsDto.departmentId,
      });
    }

    queryBuilder
      .orderBy('reviewerStaff.createdAt', pageOptionsDto.order)
      .leftJoin('reviewerStaff.department', 'department')
      .leftJoin('reviewerStaff.semester', 'semester')
      .leftJoin('reviewerStaff.projects', 'project')
      .leftJoin('project.students', 'student')
      .leftJoin('project.instructor', 'instructor')
      .loadRelationCountAndMap(
        'project.reportedCount',
        'project.progresses',
        'progress',
        (qb) =>
          qb.andWhere('progress.type = :type', {
            type: ProjectProgressType.REVIEWER_REVIEW,
          }),
      )
      .addSelect([
        'department.name',
        'semester.name',
        'semester.isLocked',
        'user.fullName',
        'user.email',
        'user.phone',
        'user.workPlace',
        'user.id',
        'project.name',
        'project.id',
        'project.status',
        'instructor.fullName',
        'instructor.email',
        'instructor.workPlace',
        'instructor.phone',
        'student.id',
        'student.fullName',
        'student.code',
      ])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    this.logger.log(`Lấy danh sách quản lý`);
    return new ReviewerPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  @Transactional()
  async createMultipleReviewerStaff(
    reviewerStaffDto: ReviewerPayloadDto[],
  ): Promise<ReviewerStaffDto[]> {
    const results = [];
    for (const staff of reviewerStaffDto) {
      const reviewerStaff = await this.createReviewerStaff(staff);
      await this.reviewerStaffRepository.save(reviewerStaff);
      this.logger.log(`Thêm mới nhóm quản lý ${reviewerStaff.id}`);
      results.push(reviewerStaff);
    }
    return results;
  }

  @Transactional()
  async createReviewerStaff(
    reviewerStaffDto: ReviewerPayloadDto,
  ): Promise<ReviewerStaffDto> {
    const reviewerStaff = this.reviewerStaffRepository.create(reviewerStaffDto);
    await this.reviewerStaffRepository.save(reviewerStaff);
    // Update status for new project
    await Promise.all(
      reviewerStaff.projects.map(async (p) => {
        await this.projectService.updateStatus(p.id, ProjectStatus.IN_REVIEW);
      }),
    );
    this.logger.log(`Thêm mới nhóm quản lý ${reviewerStaff.id}`);
    return reviewerStaff.toDto();
  }

  async getReviewerStaff(id: number): Promise<ReviewerStaffDto> {
    const reviewerStaff = await this.reviewerStaffRepository
      .createQueryBuilder('reviewerStaff')
      .where('reviewerStaff.id = :id', { id })
      .leftJoin('reviewerStaff.user', 'user')
      .leftJoin('reviewerStaff.projects', 'project')
      .leftJoin('project.instructor', 'instructor')
      .leftJoin('project.students', 'student')
      .loadRelationCountAndMap(
        'project.reportedCount',
        'project.progresses',
        'progress',
        (qb) =>
          qb.andWhere('progress.type = :type', {
            type: ProjectProgressType.REVIEWER_REVIEW,
          }),
      )
      .addSelect([
        'user.id',
        'user.fullName',
        'project.id',
        'project.name',
        'project.status',
        'instructor.id',
        'instructor.fullName',
        'student.id',
        'student.code',
        'student.fullName',
      ])
      .getOne();
    if (!reviewerStaff) {
      throw new NotFoundException('Nhóm phản biện không tồn tại');
    }
    return reviewerStaff.toDto();
  }

  @Transactional()
  async updateReviewerStaff(
    id: number,
    reviewerStaffDto: ReviewerPayloadDto,
  ): Promise<void> {
    const reviewerStaff = await this.reviewerStaffRepository.findOne({
      where: { id },
      relations: ['projects'],
    });
    if (!reviewerStaff) {
      throw new NotFoundException('Nhóm phản biện không tồn tại');
    }

    // Update status for new project
    const newProject = reviewerStaffDto.projects.filter((p) =>
      reviewerStaff.projects.every((c) => c.id !== p.id),
    );
    await Promise.all(
      newProject.map(async (p) => {
        await this.projectService.updateStatus(p.id, ProjectStatus.IN_REVIEW);
      }),
    );

    // Remove status for old project
    const oldProject = reviewerStaff.projects.filter((p) =>
      reviewerStaffDto.projects.every((c) => c.id !== p.id),
    );
    await Promise.all(
      oldProject.map(async (p) => {
        await this.projectService.updateStatus(p.id, ProjectStatus.IN_PROGRESS);
      }),
    );

    reviewerStaff.projects = [];
    this.reviewerStaffRepository.merge(reviewerStaff, reviewerStaffDto);

    await this.reviewerStaffRepository.save(reviewerStaff);
  }

  @Transactional()
  async deleteReviewerStaff(id: number): Promise<void> {
    const reviewerStaff = await this.reviewerStaffRepository
      .createQueryBuilder('reviewerStaff')
      .where('reviewerStaff.id = :id', { id })
      .leftJoin('reviewerStaff.semester', 'semester')
      .leftJoin('reviewerStaff.projects', 'project')
      .addSelect(['semester.isLocked', 'project.id', 'project.status'])
      .getOne();

    if (!reviewerStaff) {
      throw new NotFoundException('Nhóm phản biện không tồn tại');
    }

    if (reviewerStaff.semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã khoá!');
    }

    for (const project of reviewerStaff.projects) {
      if (project.status === ProjectStatus.IN_PRESENTATION) {
        throw new NotAcceptableException(
          'Không thể xoá nhóm do có đề tài đang bảo vệ!',
        );
      }
    }

    await this.reviewerStaffRepository.delete({ id });

    await Promise.all(
      reviewerStaff.projects.map(async (p) => {
        await this.projectService.updateStatus(p.id, ProjectStatus.IN_PROGRESS);
      }),
    );
  }
}
