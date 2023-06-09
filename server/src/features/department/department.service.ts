import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from './models';
import { DepartmentDto, DepartmentRequestDto } from './dtos';
import { UserEntity } from '../user/models';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
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

  async getDepartment(id: number): Promise<DepartmentDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Khoa không tồn tại');
    }
    return department.toDto();
  }

  async createDepartment(
    request: DepartmentRequestDto,
    currentUser: UserEntity,
  ): Promise<DepartmentDto> {
    const department = this.departmentRepository.create(request);
    await this.departmentRepository.insert(department);
    this.logger.log(
      `${currentUser.fullName} đã thêm mới khoa ${department.name}`,
    );
    return department.toDto();
  }

  async updateDepartment(
    id: number,
    request: DepartmentRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Khoa không tồn tại');
    }

    await this.departmentRepository.update(
      { id },
      {
        name: request.name,
        shortName: request.shortName,
        description: request.description,
      },
    );

    this.logger.log(
      `${currentUser.fullName} đã cập nhật khoa ${department.name}`,
    );
  }

  async deleteDepartment(id: number, currentUser: UserEntity): Promise<void> {
    const department = await this.departmentRepository
      .createQueryBuilder('department')
      .where('department.id = :id', { id })
      .loadRelationCountAndMap(
        'department.studentCount',
        'department.students',
        'student',
      )
      .loadRelationCountAndMap(
        'department.projectCount',
        'department.projects',
        'project',
      )
      .getOne();

    if (!department) {
      throw new NotFoundException('Khoa không tồn tại');
    }

    if (department.studentCount > 0 || department.projectCount > 0) {
      throw new NotAcceptableException(
        'Xoá không thành công do khoa đã có sinh viên hoặc đề tài.',
      );
    }

    await this.departmentRepository.delete({ id });

    this.logger.log(`${currentUser.fullName} đã xoá khoa ${department.name}`);
  }
}
