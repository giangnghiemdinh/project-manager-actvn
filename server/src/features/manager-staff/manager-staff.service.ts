import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ManagerStaffService {
  private readonly logger = new Logger(ManagerStaffService.name);

  constructor(
    @InjectRepository(ManagerStaffEntity)
    private readonly managerStaffRepository: Repository<ManagerStaffEntity>,
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
      .leftJoinAndSelect('project.students', 'student')
      .addSelect([
        'department.name',
        'semester.name',
        'user.fullName',
        'user.id',
        'project.name',
        'project.id',
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
    const managerStaff = this.managerStaffRepository.create(managerStaffDto);
    await this.managerStaffRepository.save(managerStaff);
    this.logger.log(`Thêm mới nhóm quản lý ${managerStaff.id}`);
    return managerStaff.toDto();
  }

  async getManagerStaff(id: number): Promise<ManagerStaffDto> {
    const managerStaff = await this.managerStaffRepository.findOne({
      where: { id },
      relations: [
        'user',
        'projects',
        'projects.instructor',
        'projects.students',
      ],
    });
    if (!managerStaff) {
      throw new NotFoundException('Hội đồng không tồn tại');
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

    managerStaff.projects = [];
    this.managerStaffRepository.merge(managerStaff, managerStaffDto);

    await this.managerStaffRepository.save(managerStaff);
  }

  async deleteManagerStaff(id: number): Promise<void> {
    const queryBuilder = this.managerStaffRepository
      .createQueryBuilder('managerStaff')
      .where('managerStaff.id = :id', { id });

    const managerStaff = await queryBuilder.getOne();

    if (!managerStaff) {
      throw new NotFoundException('Hội đồng không tồn tại');
    }

    await this.managerStaffRepository.remove(managerStaff);
  }
}
