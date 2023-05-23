import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from './models';
import { DepartmentDto, DepartmentPayloadDto } from './dtos';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    @InjectRepository(DepartmentEntity)
    private departmentRepository: Repository<DepartmentEntity>,
  ) {}

  async getDepartments(): Promise<DepartmentDto[]> {
    const departments = await this.departmentRepository
      .createQueryBuilder('department')
      .loadRelationCountAndMap(
        'department.studentCount',
        'department.students',
        'student',
      )
      .getMany();
    return departments.map((d) => d.toDto());
  }

  async createDepartment(
    departmentDto: DepartmentPayloadDto,
  ): Promise<DepartmentDto> {
    const department = this.departmentRepository.create(departmentDto);
    await this.departmentRepository.save(department);
    this.logger.log(`Thêm mới khoa ${department.id}`);
    return department.toDto();
  }

  async getDepartment(id: number): Promise<DepartmentDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Khoa không tồn tại');
    }
    return department.toDto();
  }

  async updateDepartment(
    id: number,
    departmentDto: DepartmentPayloadDto,
  ): Promise<void> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Khoa không tồn tại');
    }

    this.departmentRepository.merge(department, departmentDto);

    await this.departmentRepository.save(department);
  }

  async deleteDepartment(id: number): Promise<void> {
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .where('department.id = :id', { id });

    const department = await queryBuilder.getOne();

    if (!department) {
      throw new NotFoundException('Khoa không tồn tại');
    }

    await this.departmentRepository.remove(department);
  }
}
