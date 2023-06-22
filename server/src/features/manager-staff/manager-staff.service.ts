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
import { ManagerStaffEntity } from './models';
import {
  ManagerPageRequestDto,
  ManagerPageResponseDto,
  ManagerRequestDto,
  ManagerStaffDto,
} from './dtos';
import { Transactional } from 'typeorm-transactional';
import {
  CREATE_EVENT_PROCESS,
  ProjectProgressType,
  ProjectStatus,
} from '../../common/constants';
import { SemesterService } from '../semester/semester.service';
import { UserEntity } from '../user/models';
import { QueueService } from '../../shared/services';

@Injectable()
export class ManagerStaffService {
  private readonly logger = new Logger(ManagerStaffService.name);

  constructor(
    @InjectRepository(ManagerStaffEntity)
    private readonly managerStaffRepository: Repository<ManagerStaffEntity>,
    private readonly semesterService: SemesterService,
    private readonly queueService: QueueService,
  ) {}

  async getManagerStaffs(
    pageOptionsDto: ManagerPageRequestDto,
  ): Promise<Pagination<ManagerStaffDto>> {
    const queryBuilder = this.managerStaffRepository
      .createQueryBuilder('managerStaff')
      .leftJoin('managerStaff.user', 'user');

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(user.fullName) LIKE :q ', {
        q: `%${pageOptionsDto.q.toUpperCase()}%`,
      });
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('managerStaff.departmentId = :id', {
        id: pageOptionsDto.departmentId,
      });
    }

    if (pageOptionsDto.semesterId) {
      queryBuilder.andWhere('managerStaff.semesterId = :semesterId', {
        semesterId: pageOptionsDto.semesterId,
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
        'user.rank',
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
        'instructor.rank',
        'student.id',
        'student.fullName',
        'student.code',
        'student.phone',
        'student.email',
      ])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    return new ManagerPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  @Transactional()
  async createMultipleManagerStaff(
    managerStaffDto: ManagerRequestDto[],
    currentUser: UserEntity,
  ): Promise<ManagerStaffDto[]> {
    const results = [];
    for (const council of managerStaffDto) {
      const managerStaff = await this.createManagerStaff(council, currentUser);
      results.push(managerStaff);
    }
    return results;
  }

  @Transactional()
  async createManagerStaff(
    managerStaffDto: ManagerRequestDto,
    currentUser: UserEntity,
  ): Promise<ManagerStaffDto> {
    await this.validateGroup(managerStaffDto);
    const managerStaff = this.managerStaffRepository.create(managerStaffDto);
    await this.managerStaffRepository.save(managerStaff);

    await this.queueService.addEvent(
      CREATE_EVENT_PROCESS,
      {
        message: `Thêm mới nhóm quản lý {managerFullName}`,
        params: { managerId: managerStaff.id },
        userId: currentUser.id,
      },
      1000,
    );
    this.logger.log(
      `${currentUser.fullName} đã thêm mới nhóm quản lý ${managerStaff.id}`,
    );
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
      .leftJoin('managerStaff.semester', 'semester')
      .leftJoin('managerStaff.department', 'department')
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
    if (!managerStaff) {
      throw new NotFoundException('Nhóm quản lý không tồn tại');
    }
    return managerStaff.toDto();
  }

  async updateManagerStaff(
    id: number,
    managerStaffDto: ManagerRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    const managerStaff = await this.managerStaffRepository.findOne({
      where: { id },
    });
    if (!managerStaff) {
      throw new NotFoundException('Nhóm quản lý không tồn tại');
    }

    await this.validateGroup(managerStaffDto, id);

    managerStaff.projects = [];
    this.managerStaffRepository.merge(managerStaff, managerStaffDto);

    await this.managerStaffRepository.save(managerStaff);

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Cập nhật nhóm quản lý {managerFullName}`,
      params: {
        managerId: managerStaff.id,
      },
      userId: currentUser.id,
    });

    this.logger.log(
      `${currentUser.fullName} đã cập nhật nhóm quản lý ${managerStaff.id}`,
    );
  }

  async deleteManagerStaff(id: number, currentUser: UserEntity): Promise<void> {
    const managerStaff = await this.managerStaffRepository
      .createQueryBuilder('managerStaff')
      .where('managerStaff.id = :id', { id })
      .leftJoin('managerStaff.user', 'user')
      .leftJoin('managerStaff.semester', 'semester')
      .leftJoin('managerStaff.department', 'department')
      .leftJoin('managerStaff.projects', 'project')
      .addSelect([
        'user.id',
        'user.fullName',
        'semester.isLocked',
        'semester.name',
        'department.name',
        'project.id',
        'project.status',
      ])
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

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Xoá nhóm quản lý {managerFullName} | ${managerStaff.semester?.name} | ${managerStaff.department?.name}`,
      params: {
        managerFullName: managerStaff.user?.fullName,
      },
      userId: currentUser.id,
    });

    this.logger.log(
      `${currentUser.fullName} đã xoá nhóm quản lý ${managerStaff.id}`,
    );
  }

  private async validateGroup(request: ManagerRequestDto, id?: number) {
    await this.semesterService.validateLockedSemester(request.semesterId);
    const queryBuilder = this.managerStaffRepository
      .createQueryBuilder('managerStaff')
      .where('managerStaff.semesterId = :semesterId', {
        semesterId: request.semesterId,
      })
      .andWhere('managerStaff.departmentId = :departmentId', {
        departmentId: request.departmentId,
      })
      .andWhere('managerStaff.userId = :userId', {
        userId: request.userId,
      });

    if (id) {
      queryBuilder.andWhere('managerStaff.id <> :id', { id });
    }

    const isExist = await queryBuilder.getExists();
    if (isExist) {
      throw new ConflictException('Giảng viên đang quản lý nhóm khác.');
    }
  }
}
