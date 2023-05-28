import {
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
  ExaminerPagePayloadDto,
  ExaminerPageResponseDto,
  ExaminerPayloadDto,
} from './dtos';
import { Transactional } from 'typeorm-transactional';
import { ProjectService } from '../project/project.service';
import { ExaminerCouncilUserEntity } from './models/examiner-council-user.entity';
import { ProjectStatus } from '../../common/constants';
import { SemesterService } from '../semester/semester.service';

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
  ) {}

  async getExaminerCouncils(
    pageOptionsDto: ExaminerPagePayloadDto,
  ): Promise<Pagination<ExaminerCouncilDto>> {
    const queryBuilder =
      this.examinerCouncilRepository.createQueryBuilder('examinerCouncil');

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(examinerCouncil.location) LIKE :q ', {
        q: `${pageOptionsDto.q.toUpperCase()}`,
      });
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('examinerCouncil.departmentId = :id', {
        id: pageOptionsDto.departmentId,
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
        'project.id',
        'project.name',
        'project.conclusionScore',
        'instructor.id',
        'instructor.fullName',
        'instructor.workPlace',
        'instructor.email',
        'instructor.phone',
        'student.id',
        'student.code',
        'student.fullName',
        'reviewerStaff.id',
        'reviewerStaffUser.id',
        'reviewerStaffUser.fullName',
        'reviewerStaffUser.email',
        'reviewerStaffUser.phone',
        'reviewerStaffUser.workPlace',
      ])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    this.logger.log(`Lấy danh sách quản lý`);
    return new ExaminerPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  @Transactional()
  async createMultipleExaminerCouncil(
    examinerCouncilDto: ExaminerPayloadDto[],
  ): Promise<ExaminerCouncilDto[]> {
    const results = [];
    for (const council of examinerCouncilDto) {
      const examinerCouncil = await this.createExaminerCouncil(council);
      results.push(examinerCouncil);
    }
    return results;
  }

  @Transactional()
  async createExaminerCouncil(
    examinerCouncilDto: ExaminerPayloadDto,
  ): Promise<ExaminerCouncilDto> {
    await this.semesterService.validateLockedSemester(
      examinerCouncilDto.semesterId,
    );

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

    this.logger.log(`Thêm mới nhóm quản lý ${examinerCouncil.id}`);
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
        'project.id',
        'project.name',
        'project.status',
        'project.conclusionScore',
        'student.id',
        'student.code',
        'student.fullName',
        'instructor.id',
        'instructor.fullName',
        'reviewerStaff.id',
        'reviewerStaffUser.id',
        'reviewerStaffUser.fullName',
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
    examinerCouncilDto: ExaminerPayloadDto,
  ): Promise<void> {
    await this.semesterService.validateLockedSemester(
      examinerCouncilDto.semesterId,
    );

    const examinerCouncil = await this.examinerCouncilRepository.findOne({
      where: { id },
      relations: ['users', 'projects'],
    });
    if (!examinerCouncil) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

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
  }

  @Transactional()
  async deleteExaminerCouncil(id: number): Promise<void> {
    const queryBuilder = this.examinerCouncilRepository
      .createQueryBuilder('examinerCouncil')
      .leftJoin('examinerCouncil.projects', 'project')
      .leftJoin('examinerCouncil.users', 'member')
      .leftJoin('examinerCouncil.semester', 'semester')
      .where('examinerCouncil.id = :id', { id })
      .addSelect([
        'semester.isLocked',
        'member.id',
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
  }
}
