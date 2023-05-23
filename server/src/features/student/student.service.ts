import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './models';
import {
  StudentDto,
  StudentPagePayloadDto,
  StudentPageResponseDto,
  StudentPayloadDto,
} from './dtos';
import { Pagination, PaginationMetaDto } from '../../common/dtos';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
  ) {}

  get queryBuilder() {
    return this.studentRepository.createQueryBuilder('student');
  }

  findByCode(code: string) {
    return this.studentRepository.findOne({ where: { code } });
  }

  async getStudents(
    pageOptionsDto: StudentPagePayloadDto,
  ): Promise<Pagination<StudentDto>> {
    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    if (pageOptionsDto.q) {
      queryBuilder.where(
        'UCASE(student.firstName) LIKE :q ' +
          'OR UCASE(student.lastName) LIKE :q ' +
          'OR UCASE(student.code) LIKE :q',
        { q: `${pageOptionsDto.q.toUpperCase()}` },
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
      .leftJoin('student.projects', 'project')
      .addSelect(['project.id', 'project.name', 'project.semester'])
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

  async createStudent(studentDto: StudentPayloadDto): Promise<StudentDto> {
    const student = this.studentRepository.create(studentDto);
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

  async updateStudent(
    id: number,
    studentDto: StudentPayloadDto,
  ): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { id },
    });
    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    this.studentRepository.merge(student, studentDto);

    await this.studentRepository.save(student);
  }

  async deleteStudent(id: number): Promise<void> {
    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .where('student.id = :id', { id });

    const student = await queryBuilder.getOne();

    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }

    await this.studentRepository.remove(student);
  }
}
