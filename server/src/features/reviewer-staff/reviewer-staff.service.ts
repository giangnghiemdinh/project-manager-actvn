import {
  ConflictException,
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
  ReviewerPageRequestDto,
  ReviewerPageResponseDto,
  ReviewerRequestDto,
  ReviewerStaffDto,
} from './dtos';
import { Transactional } from 'typeorm-transactional';
import { ProjectService } from '../project/project.service';
import {
  CREATE_EVENT_PROCESS,
  ProjectProgressType,
  ProjectStatus,
} from 'src/common/constants';
import { UserEntity } from '../user/models';
import { QueueService } from '../../shared/services';
import { SemesterService } from '../semester/semester.service';

@Injectable()
export class ReviewerStaffService {
  private readonly logger = new Logger(ReviewerStaffService.name);

  constructor(
    @InjectRepository(ReviewerStaffEntity)
    private reviewerStaffRepository: Repository<ReviewerStaffEntity>,
    private readonly projectService: ProjectService,
    private readonly semesterService: SemesterService,
    private readonly queueService: QueueService,
  ) {}

  async getReviewerStaffs(
    pageOptionsDto: ReviewerPageRequestDto,
  ): Promise<Pagination<ReviewerStaffDto>> {
    const queryBuilder = this.reviewerStaffRepository
      .createQueryBuilder('reviewerStaff')
      .leftJoin('reviewerStaff.user', 'user');

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(user.fullName) LIKE :q ', {
        q: `%${pageOptionsDto.q.toUpperCase()}%`,
      });
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('reviewerStaff.departmentId = :id', {
        id: pageOptionsDto.departmentId,
      });
    }

    if (pageOptionsDto.semesterId) {
      queryBuilder.andWhere('reviewerStaff.semesterId = :semesterId', {
        semesterId: pageOptionsDto.semesterId,
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
        'user.rank',
        'user.workPlace',
        'user.id',
        'project.name',
        'project.id',
        'project.status',
        'instructor.fullName',
        'instructor.email',
        'instructor.workPlace',
        'instructor.phone',
        'instructor.rank',
        'student.id',
        'student.fullName',
        'student.code',
        'student.email',
        'student.phone',
      ])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    return new ReviewerPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  @Transactional()
  async createMultipleReviewerStaff(
    reviewerStaffDto: ReviewerRequestDto[],
    currentUser: UserEntity,
  ): Promise<ReviewerStaffDto[]> {
    const results = [];
    for (const staff of reviewerStaffDto) {
      const reviewerStaff = await this.createReviewerStaff(staff, currentUser);
      results.push(reviewerStaff);
    }
    return results;
  }

  @Transactional()
  async createReviewerStaff(
    reviewerStaffDto: ReviewerRequestDto,
    currentUser: UserEntity,
  ): Promise<ReviewerStaffDto> {
    await this.validateGroup(reviewerStaffDto);

    const reviewerStaff = this.reviewerStaffRepository.create(reviewerStaffDto);
    await this.reviewerStaffRepository.save(reviewerStaff);
    // Update status for new project
    await Promise.all(
      reviewerStaff.projects.map(async (p) => {
        await this.projectService.updateStatus(p.id, ProjectStatus.IN_REVIEW);
      }),
    );

    await this.queueService.addEvent(
      CREATE_EVENT_PROCESS,
      {
        message: `Thêm mới nhóm phản biện {reviewerFullName}`,
        params: { reviewerId: reviewerStaff.id },
        userId: currentUser.id,
      },
      1000,
    );
    this.logger.log(
      `${currentUser.fullName} đã thêm mới nhóm phản biện ${reviewerStaff.id}`,
    );
    return reviewerStaff.toDto();
  }

  async getReviewerStaff(id: number): Promise<ReviewerStaffDto> {
    const reviewerStaff = await this.reviewerStaffRepository
      .createQueryBuilder('reviewerStaff')
      .where('reviewerStaff.id = :id', { id })
      .leftJoin('reviewerStaff.user', 'user')
      .leftJoin('reviewerStaff.semester', 'semester')
      .leftJoin('reviewerStaff.department', 'department')
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
        'user.rank',
        'project.id',
        'project.name',
        'project.status',
        'instructor.id',
        'instructor.fullName',
        'instructor.rank',
        'student.id',
        'student.code',
        'student.fullName',
        'semester.name',
        'department.name',
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
    reviewerStaffDto: ReviewerRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    const reviewerStaff = await this.reviewerStaffRepository.findOne({
      where: { id },
      relations: ['projects'],
    });
    if (!reviewerStaff) {
      throw new NotFoundException('Nhóm phản biện không tồn tại');
    }

    await this.validateGroup(reviewerStaffDto, id);

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

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Cập nhật nhóm phản biện {reviewerFullName}`,
      params: { reviewerId: reviewerStaff.id },
      userId: currentUser.id,
    });

    this.logger.log(
      `${currentUser.fullName} đã cập nhật nhóm phản biện ${reviewerStaff.id}`,
    );
  }

  @Transactional()
  async deleteReviewerStaff(
    id: number,
    currentUser: UserEntity,
  ): Promise<void> {
    const reviewerStaff = await this.reviewerStaffRepository
      .createQueryBuilder('reviewerStaff')
      .where('reviewerStaff.id = :id', { id })
      .leftJoin('reviewerStaff.user', 'user')
      .leftJoin('reviewerStaff.semester', 'semester')
      .leftJoin('reviewerStaff.department', 'department')
      .leftJoin('reviewerStaff.projects', 'project')
      .addSelect([
        'user.id',
        'user.fullName',
        'semester.name',
        'department.name',
        'semester.isLocked',
        'project.id',
        'project.status',
      ])
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

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Xoá nhóm phản biện {reviewerFullName} | ${reviewerStaff.semester?.name} | ${reviewerStaff.department?.name}`,
      params: { reviewerFullName: reviewerStaff.user?.fullName },
      userId: currentUser.id,
    });

    this.logger.log(
      `${currentUser.fullName} đã xoá nhóm phản biện ${reviewerStaff.id}`,
    );
  }

  private async validateGroup(request: ReviewerRequestDto, id?: number) {
    await this.semesterService.validateLockedSemester(request.semesterId);
    const queryBuilder = this.reviewerStaffRepository
      .createQueryBuilder('reviewerStaff')
      .where('reviewerStaff.semesterId = :semesterId', {
        semesterId: request.semesterId,
      })
      .andWhere('reviewerStaff.departmentId = :departmentId', {
        departmentId: request.departmentId,
      })
      .andWhere('reviewerStaff.userId = :userId', {
        userId: request.userId,
      });

    if (id) {
      queryBuilder.andWhere('reviewerStaff.id <> :id', { id });
    }

    const isExist = await queryBuilder.getExists();
    if (isExist) {
      throw new ConflictException('Giảng viên đang chấm phản biện nhóm khác.');
    }
  }
}
