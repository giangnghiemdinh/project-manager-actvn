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
import { ExaminerCouncilEntity } from './models';
import {
  ExaminerCouncilDto,
  ExaminerPageRequestDto,
  ExaminerPageResponseDto,
  ExaminerRequestDto,
} from './dtos';
import { Transactional } from 'typeorm-transactional';
import { ProjectService } from '../project/project.service';
import { ExaminerCouncilUserEntity } from './models/examiner-council-user.entity';
import { CREATE_EVENT_PROCESS, ProjectStatus } from '../../common/constants';
import { SemesterService } from '../semester/semester.service';
import { UserEntity } from '../user/models';
import { QueueService } from '../../shared/services';

@Injectable()
export class ExaminerCouncilService {
  private readonly logger = new Logger(ExaminerCouncilService.name);

  constructor(
    @InjectRepository(ExaminerCouncilEntity)
    private readonly examinerCouncilRepository: Repository<ExaminerCouncilEntity>,

    @InjectRepository(ExaminerCouncilUserEntity)
    private readonly examinerCouncilUserRepository: Repository<ExaminerCouncilUserEntity>,
    private readonly projectService: ProjectService,
    private readonly semesterService: SemesterService,
    private readonly queueService: QueueService,
  ) {}

  async getExaminerCouncils(
    pageOptionsDto: ExaminerPageRequestDto,
  ): Promise<Pagination<ExaminerCouncilDto>> {
    const queryBuilder =
      this.examinerCouncilRepository.createQueryBuilder('examinerCouncil');

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(examinerCouncil.location) LIKE :q ', {
        q: `%${pageOptionsDto.q.toUpperCase()}%`,
      });
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('examinerCouncil.departmentId = :id', {
        id: pageOptionsDto.departmentId,
      });
    }

    if (pageOptionsDto.semesterId) {
      queryBuilder.andWhere('examinerCouncil.semesterId = :semesterId', {
        semesterId: pageOptionsDto.semesterId,
      });
    }

    queryBuilder
      .orderBy('examinerCouncil.createdAt', pageOptionsDto.order)
      .leftJoin('examinerCouncil.department', 'department')
      .leftJoin('examinerCouncil.semester', 'semester')
      .leftJoin('examinerCouncil.users', 'member')
      .leftJoin('member.user', 'user')
      .leftJoin('examinerCouncil.projects', 'project')
      .leftJoin('project.instructor', 'instructor')
      .leftJoin('project.students', 'student')
      .leftJoin('project.reviewerStaff', 'reviewerStaff')
      .leftJoin('reviewerStaff.user', 'reviewerStaffUser')
      .addSelect([
        'department.id',
        'department.name',
        'semester.id',
        'semester.name',
        'semester.isLocked',
        'member.id',
        'member.position',
        'user.id',
        'user.fullName',
        'user.rank',
        'project.id',
        'project.name',
        'project.conclusionScore',
        'instructor.id',
        'instructor.fullName',
        'instructor.workPlace',
        'instructor.email',
        'instructor.phone',
        'instructor.rank',
        'student.id',
        'student.code',
        'student.fullName',
        'reviewerStaff.id',
        'reviewerStaffUser.id',
        'reviewerStaffUser.fullName',
        'reviewerStaffUser.rank',
        'reviewerStaffUser.email',
        'reviewerStaffUser.phone',
        'reviewerStaffUser.workPlace',
      ])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    return new ExaminerPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  @Transactional()
  async createMultipleExaminerCouncil(
    examinerCouncilDto: ExaminerRequestDto[],
    currentUser: UserEntity,
  ): Promise<ExaminerCouncilDto[]> {
    const results = [];
    for (const council of examinerCouncilDto) {
      const examinerCouncil = await this.createExaminerCouncil(
        council,
        currentUser,
      );
      results.push(examinerCouncil);
    }
    return results;
  }

  @Transactional()
  async createExaminerCouncil(
    examinerCouncilDto: ExaminerRequestDto,
    currentUser: UserEntity,
  ): Promise<ExaminerCouncilDto> {
    await this.validateCouncil(examinerCouncilDto);

    const examinerCouncil =
      this.examinerCouncilRepository.create(examinerCouncilDto);
    await this.examinerCouncilRepository.save(examinerCouncil);

    await Promise.all(
      examinerCouncil.projects.map(async (p) => {
        await this.projectService.updateStatus(
          p.id,
          ProjectStatus.IN_PRESENTATION,
        );
      }),
    );
    await this.queueService.addEvent(
      CREATE_EVENT_PROCESS,
      {
        message: `Thêm mới hội đồng {councilLocation}`,
        params: {
          councilLocation: examinerCouncil.location,
          councilId: examinerCouncil.id,
        },
        userId: currentUser.id,
      },
      1000,
    );
    this.logger.log(
      `${currentUser.fullName} đã thêm mới hội đồng ${examinerCouncil.id}`,
    );
    return examinerCouncil.toDto();
  }

  async getExaminerCouncil(id: number): Promise<ExaminerCouncilDto> {
    const examinerCouncil = await this.examinerCouncilRepository
      .createQueryBuilder('examinerCouncil')
      .leftJoin('examinerCouncil.users', 'member')
      .leftJoin('member.user', 'user')
      .leftJoin('examinerCouncil.projects', 'project')
      .leftJoin('project.students', 'student')
      .leftJoin('project.instructor', 'instructor')
      .leftJoin('examinerCouncil.semester', 'semester')
      .leftJoin('examinerCouncil.department', 'department')
      .leftJoin('project.reviewerStaff', 'reviewerStaff')
      .leftJoin('reviewerStaff.user', 'reviewerStaffUser')
      .where('examinerCouncil.id = :id', { id })
      .addSelect([
        'examinerCouncil.id',
        'examinerCouncil.location',
        'examinerCouncil.departmentId',
        'examinerCouncil.semesterId',
        'member.id',
        'member.position',
        'member.userId',
        'user.id',
        'user.fullName',
        'user.rank',
        'project.id',
        'project.name',
        'project.status',
        'project.conclusionScore',
        'student.id',
        'student.code',
        'student.fullName',
        'student.email',
        'student.phone',
        'instructor.id',
        'instructor.fullName',
        'instructor.rank',
        'reviewerStaff.id',
        'reviewerStaffUser.id',
        'reviewerStaffUser.fullName',
        'reviewerStaffUser.rank',
        'department.name',
        'semester.name',
      ])
      .getOne();
    if (!examinerCouncil) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }
    return examinerCouncil.toDto();
  }

  @Transactional()
  async updateExaminerCouncil(
    id: number,
    examinerCouncilDto: ExaminerRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    const examinerCouncil = await this.examinerCouncilRepository.findOne({
      where: { id },
      relations: ['users', 'projects'],
    });
    if (!examinerCouncil) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    await this.validateCouncil(examinerCouncilDto, id);

    // Update status for new project
    const newProject = examinerCouncilDto.projects.filter((p) =>
      examinerCouncil.projects.every((c) => c.id !== p.id),
    );
    await Promise.all(
      newProject.map(async (p) => {
        await this.projectService.updateStatus(
          p.id,
          ProjectStatus.IN_PRESENTATION,
        );
      }),
    );

    // Remove status for old project
    const oldProject = examinerCouncil.projects.filter((p) =>
      examinerCouncilDto.projects.every((c) => c.id !== p.id),
    );
    if (oldProject.some((o) => o.conclusionScore)) {
      throw new NotAcceptableException(
        'Không thể xoá đề tài đã có điểm bảo vệ!',
      );
    }
    await Promise.all(
      oldProject.map(async (p) => {
        await this.projectService.updateStatus(p.id, ProjectStatus.IN_REVIEW);
      }),
    );

    // Remove old user
    const oldUser = examinerCouncil.users.filter((u) =>
      examinerCouncilDto.users.every((o) => o.id !== u.id),
    );
    await Promise.all(
      oldUser.map(async (p) => {
        await this.examinerCouncilUserRepository.delete({ id: p.id });
      }),
    );

    examinerCouncil.users = [];
    examinerCouncil.projects = [];
    this.examinerCouncilRepository.merge(examinerCouncil, examinerCouncilDto);

    await this.examinerCouncilRepository.save(examinerCouncil);

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Cập nhật hội đồng {councilLocation}`,
      params: {
        councilLocation: examinerCouncil.location,
        councilId: examinerCouncil.id,
      },
      userId: currentUser.id,
    });

    this.logger.log(
      `${currentUser.fullName} đã cập nhật hội đồng ${examinerCouncil.id}`,
    );
  }

  @Transactional()
  async deleteExaminerCouncil(
    id: number,
    currentUser: UserEntity,
  ): Promise<void> {
    const queryBuilder = this.examinerCouncilRepository
      .createQueryBuilder('examinerCouncil')
      .leftJoin('examinerCouncil.projects', 'project')
      .leftJoin('examinerCouncil.users', 'member')
      .leftJoin('examinerCouncil.semester', 'semester')
      .leftJoin('examinerCouncil.department', 'department')
      .where('examinerCouncil.id = :id', { id })
      .addSelect([
        'semester.isLocked',
        'semester.name',
        'member.id',
        'department.name',
        'project.id',
        'project.conclusionScore',
      ]);

    const examinerCouncil = await queryBuilder.getOne();

    if (!examinerCouncil) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    if (examinerCouncil.semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã khoá!');
    }

    if (examinerCouncil.projects.some((p) => p.conclusionScore)) {
      throw new NotAcceptableException(
        'Không thể xoá hội đồng do có đề tài đã có điểm bảo vệ!',
      );
    }

    // Remove all user
    await Promise.all(
      examinerCouncil.users.map(async (p) => {
        await this.examinerCouncilUserRepository.delete({ id: p.id });
      }),
    );

    await this.examinerCouncilRepository.remove(examinerCouncil);

    await Promise.all(
      examinerCouncil.projects.map(async (p) => {
        await this.projectService.updateStatus(p.id, ProjectStatus.IN_REVIEW);
      }),
    );

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Xoá hội đồng {councilLocation} | ${examinerCouncil.semester?.name} | ${examinerCouncil.department?.name}`,
      params: {
        councilLocation: examinerCouncil.location,
      },
      userId: currentUser.id,
    });

    this.logger.log(
      `${currentUser.fullName} đã xoá hội đồng ${examinerCouncil.id}`,
    );
  }

  private async validateCouncil(request: ExaminerRequestDto, id?: number) {
    await this.semesterService.validateLockedSemester(request.semesterId);
    const queryBuilder = this.examinerCouncilRepository
      .createQueryBuilder('examinerCouncil')
      .where('examinerCouncil.semesterId = :semesterId', {
        semesterId: request.semesterId,
      })
      .andWhere('examinerCouncil.departmentId = :departmentId', {
        departmentId: request.departmentId,
      })
      .leftJoin('examinerCouncil.users', 'member')
      .leftJoin('member.user', 'user')
      .andWhere('member.userId IN (:...userIds)', {
        userIds: request.users?.map((u) => u.userId),
      })
      .addSelect(['member.id', 'member.userId', 'user.id', 'user.fullName']);

    if (id) {
      queryBuilder.andWhere('examinerCouncil.id <> :id', { id });
    }

    const existCouncil = await queryBuilder.getOne();
    if (existCouncil) {
      const duplicateUsers = existCouncil.users
        .filter((m) => request.users.some((u) => u.userId === m.userId))
        .map((m) => m.user?.fullName);
      throw new ConflictException(
        `Giảng viên ${duplicateUsers.join(', ')} đã thuộc hội đồng khác.`,
      );
    }
  }
}
