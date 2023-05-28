import {
  ConflictException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './models';
import {
  StudentDto,
  StudentImportRequestDto,
  StudentPageRequestDto,
  StudentPageResponseDto,
  StudentRequestDto,
} from './dtos';
import { Pagination, PaginationMetaDto } from '../../common/dtos';
import { Transactional } from 'typeorm-transactional';
import { UserEntity } from '../user/models';
import { STUDENT_DUPLICATE_CODE } from '../../common/constants';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
  ) {}

  findByCode(code: string) {
    return this.studentRepository.findOne({ where: { code } });
  }

  async getStudents(
    pageOptionsDto: StudentPageRequestDto,
  ): Promise<Pagination<StudentDto>> {
    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    if (pageOptionsDto.q) {
      queryBuilder.where(
        'UCASE(student.fullName) LIKE :q ' +
          'OR UCASE(student.email) LIKE :q ' +
          'OR UCASE(student.phone) LIKE :q ' +
          'OR UCASE(student.code) LIKE :q',
        { q: `%${pageOptionsDto.q.toUpperCase()}%` },
      );
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('student.departmentId = :id', {
        id: pageOptionsDto.departmentId,
      });
    }

    queryBuilder
      .orderBy('student.createdAt', pageOptionsDto.order)
      .leftJoinAndSelect('student.department', 'department')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    this.logger.log(`Lấy danh sách sinh viên`);
    return new StudentPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  async createStudent(request: StudentRequestDto): Promise<StudentDto> {
    const student = this.studentRepository.create(request);
    await this.studentRepository.insert(student);
    this.logger.log(`Thêm mới sinh viên ${student.id}`);
    return student.toDto();
  }

  async getStudent(id: number): Promise<StudentDto> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }
    return student.toDto();
  }

  async updateStudent(id: number, request: StudentRequestDto): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    await this.studentRepository.update(
      { id },
      {
        fullName: request.fullName,
        code: request.code,
        email: request.email,
        phone: request.phone,
        gender: request.gender,
        birthday: request.birthday,
        departmentId: request.departmentId,
      },
    );
  }

  async deleteStudent(id: number): Promise<void> {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.id = :id', { id })
      .loadRelationCountAndMap(
        'student.projectCount',
        'student.projects',
        'project',
      )
      .getOne();

    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    if (student.projectCount > 0) {
      throw new NotAcceptableException(
        'Xoá không thành công do sinh viên có thực hiện đồ án!',
      );
    }

    await this.studentRepository.delete({ id });
  }

  @Transactional()
  async importStudent(
    request: StudentImportRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    for (const student of request.students) {
      const isExist = await this.studentRepository.exist({
        where: { code: student.code },
      });
      if (!isExist) {
        await this.createStudent(student);
        continue;
      }
      switch (request.duplicateCode) {
        case STUDENT_DUPLICATE_CODE.STOP:
          throw new ConflictException(
            `Mã sinh viên ${student.code} đã tồn tại!`,
          );
        default:
          await this.studentRepository.update(
            { code: student.code },
            {
              fullName: student.fullName,
              code: student.code,
              email: student.email,
              phone: student.phone,
              gender: student.gender,
              birthday: student.birthday,
              departmentId: student.departmentId,
            },
          );
      }
    }
  }
}
