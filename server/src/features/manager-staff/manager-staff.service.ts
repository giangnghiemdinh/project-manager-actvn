import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination, PaginationMetaDto } from '../../common/dtos';
import { ManagerStaffEntity } from './models';
import {
  ManagerPagePayloadDto,
  ManagerPageResponseDto,
  ManagerPayloadDto,
  ManagerStaffDto,
} from './dtos';
import { Transactional } from 'typeorm-transactional';
import { ProjectProgressType, ProjectStatus } from '../../common/constants';
import { SemesterService } from '../semester/semester.service';

@Injectable()
export class ManagerStaffService {
  private readonly logger = new Logger(ManagerStaffService.name);

  constructor(
    @InjectRepository(ManagerStaffEntity)
    private readonly managerStaffRepository: Repository<ManagerStaffEntity>,

    private readonly semesterService: SemesterService,
  ) {}

  async getManagerStaffs(
    pageOptionsDto: ManagerPagePayloadDto,
  ): Promise<Pagination<ManagerStaffDto>> {
    const queryBuilder = this.managerStaffRepository
      .createQueryBuilder('managerStaff')
      .leftJoin('managerStaff.user', 'user');

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(user.fullName) LIKE :q ', {
        q: `${pageOptionsDto.q.toUpperCase()}`,
      });
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('managerStaff.departmentId = :id', {
        id: pageOptionsDto.departmentId,
      });
    }

    queryBuilder
      .orderBy('managerStaff.createdAt', pageOptionsDto.order)
      .leftJoin('managerStaff.department', 'department')
      .leftJoin('managerStaff.semester', 'semester')
      .leftJoin('managerStaff.projects', 'project')
      .leftJoin('project.students', 'student')
      .leftJoin('project.instructor', 'instructor')
      .loadRelationCountAndMap(
        'project.reportedCount',
        'project.progresses',
        'progress',
        (qb) =>
          qb.andWhere('progress.type NOT IN (:...types)', {
            types: [
              ProjectProgressType.INSTRUCTOR_REVIEW,
              ProjectProgressType.REVIEWER_REVIEW,
            ],
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
    return new ManagerPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  @Transactional()
  async createMultipleManagerStaff(
    managerStaffDto: ManagerPayloadDto[],
  ): Promise<ManagerStaffDto[]> {
    const results = [];
    for (const council of managerStaffDto) {
      const managerStaff = await this.createManagerStaff(council);
      this.logger.log(`Thêm mới nhóm quản lý ${managerStaff.id}`);
      results.push(managerStaff);
    }
    return results;
  }

  async createManagerStaff(
    managerStaffDto: ManagerPayloadDto,
  ): Promise<ManagerStaffDto> {
    await this.semesterService.validateLockedSemester(
      managerStaffDto.semesterId,
    );
    const managerStaff = this.managerStaffRepository.create(managerStaffDto);
    await this.managerStaffRepository.save(managerStaff);
    this.logger.log(`Thêm mới nhóm quản lý ${managerStaff.id}`);
    return managerStaff.toDto();
  }

  async getManagerStaff(id: number): Promise<ManagerStaffDto> {
    const managerStaff = await this.managerStaffRepository
      .createQueryBuilder('managerStaff')
      .where('managerStaff.id = :id', { id })
      .leftJoin('managerStaff.user', 'user')
      .leftJoin('managerStaff.projects', 'project')
      .leftJoin('project.instructor', 'instructor')
      .leftJoin('project.students', 'student')
      .loadRelationCountAndMap(
        'project.reportedCount',
        'project.progresses',
        'progress',
        (qb) =>
          qb.andWhere('progress.type NOT IN (:...types)', {
            types: [
              ProjectProgressType.INSTRUCTOR_REVIEW,
              ProjectProgressType.REVIEWER_REVIEW,
            ],
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
    if (!managerStaff) {
      throw new NotFoundException('Nhóm quản lý không tồn tại');
    }
    return managerStaff.toDto();
  }

  async updateManagerStaff(
    id: number,
    managerStaffDto: ManagerPayloadDto,
  ): Promise<void> {
    const managerStaff = await this.managerStaffRepository.findOne({
      where: { id },
    });
    if (!managerStaff) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    await this.semesterService.validateLockedSemester(
      managerStaffDto.semesterId,
    );

    managerStaff.projects = [];
    this.managerStaffRepository.merge(managerStaff, managerStaffDto);

    await this.managerStaffRepository.save(managerStaff);
  }

  async deleteManagerStaff(id: number): Promise<void> {
    const managerStaff = await this.managerStaffRepository
      .createQueryBuilder('managerStaff')
      .where('managerStaff.id = :id', { id })
      .leftJoin('managerStaff.semester', 'semester')
      .leftJoin('managerStaff.projects', 'project')
      .addSelect(['semester.isLocked', 'project.id', 'project.status'])
      .getOne();

    if (!managerStaff) {
      throw new NotFoundException('Nhóm quản lý không tồn tại');
    }

    if (managerStaff.semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã khoá!');
    }

    for (const project of managerStaff.projects) {
      if (project.status === ProjectStatus.IN_REVIEW) {
        throw new NotAcceptableException(
          'Không thể xoá nhóm do có đề tài đang chấm phản biện!',
        );
      }
      if (project.status === ProjectStatus.IN_PRESENTATION) {
        throw new NotAcceptableException(
          'Không thể xoá nhóm do có đề tài đang chấm bảo vệ!',
        );
      }
    }

    await this.managerStaffRepository.delete({ id });
  }
}
