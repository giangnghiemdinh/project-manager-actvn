import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { SemesterDto, SemesterPayloadDto } from './dtos';
import { SemesterEntity } from './models';

@Injectable()
export class SemesterService {
  private readonly logger = new Logger(SemesterService.name);

  constructor(
    @InjectRepository(SemesterEntity)
    private semesterRepository: Repository<SemesterEntity>,
  ) {}

  getCurrentSemester() {
    const current = new Date();
    return this.semesterRepository.findOne({
      where: { start: LessThanOrEqual(current), end: MoreThanOrEqual(current) },
    });
  }

  async getSemesters(): Promise<SemesterDto[]> {
    const semesters = await this.semesterRepository
      .createQueryBuilder('semester')
      .getMany();
    return semesters.map((d) => d.toDto());
  }

  async createSemester(semesterDto: SemesterPayloadDto): Promise<SemesterDto> {
    const semester = this.semesterRepository.create(semesterDto);
    await this.semesterRepository.save(semester);
    this.logger.log(`Thêm mới học kỳ ${semester.id}`);
    return semester.toDto();
  }

  async getSemester(id: number): Promise<SemesterDto> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
    });
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại!');
    }
    return semester.toDto();
  }

  async updateSemester(
    id: number,
    semesterDto: SemesterPayloadDto,
  ): Promise<void> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
    });
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại!');
    }

    this.semesterRepository.merge(semester, semesterDto);

    await this.semesterRepository.save(semester);
  }

  async deleteSemester(id: number): Promise<void> {
    const queryBuilder = this.semesterRepository
      .createQueryBuilder('semester')
      .where('semester.id = :id', { id });

    const semester = await queryBuilder.getOne();

    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại!');
    }

    await this.semesterRepository.remove(semester);
  }
}
